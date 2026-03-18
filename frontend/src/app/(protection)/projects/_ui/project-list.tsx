"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Search } from "lucide-react";
import { motion } from "motion/react";
import { useDebouncedValue } from "@tanstack/react-pacer";
import { useInfiniteQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { CustomInput } from "@/components/ui/input";
import {
  CustomSelect,
  SelectOption,
} from "@/components/ui/input/custom-select";
import { PaginatedMeta } from "@/lib/base-api";
import { capitalizeWords, enumToSelectOptions } from "@/lib/utils";
import { ProjectStatus, PROJECT_TYPE_LABELS } from "@personalization/shared";
import { useTranslations } from "next-intl";

import { fetchProjects, ProjectFilter } from "../_lib/dal";
import { Project } from "../_types/project";
import { ProjectCard } from "./project-card";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

interface ProjectListProps {
  initialProjects?: Project[];
  initialMeta?: PaginatedMeta;
}

export const ProjectList = ({
  initialProjects = [],
  initialMeta,
}: ProjectListProps) => {
  const t = useTranslations("Projects");

  const statusOptions: SelectOption[] = useMemo(() => {
    const allOption: SelectOption = { value: "all", label: t("all") };
    return [
      allOption,
      ...enumToSelectOptions(ProjectStatus)
        .filter((op) => op.value !== ProjectStatus.archived)
        .map((op) => ({ ...op, label: capitalizeWords(op.label.toLowerCase()) })),
    ];
  }, [t]);

  const typeOptions: SelectOption[] = useMemo(() => {
    const allOption: SelectOption = { value: "all", label: t("all") };
    return [
      allOption,
      ...enumToSelectOptions(PROJECT_TYPE_LABELS),
    ];
  }, [t]);

  const [filter, setFilter] = useState<Omit<ProjectFilter, "searchTerm">>({
    status: undefined,
    type: undefined,
  });
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [debouncedSearchTerm] = useDebouncedValue(searchTerm, { wait: 200 });

  const isInitialState =
    searchTerm === null && Object.values(filter).every((v) => v === null);

  const observerRef = useRef<HTMLDivElement>(null);

  // Use useInfiniteQuery for infinite scrolling
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["projects", filter, debouncedSearchTerm],
    queryFn: ({ pageParam = 1, signal }) =>
      fetchProjects(
        { ...filter, searchTerm: debouncedSearchTerm },
        pageParam,
        10,
        signal
      ),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.meta?.next && allPages.length < lastPage.meta.total) {
        return allPages.length + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    initialData:
      isInitialState && initialProjects.length > 0
        ? {
            pageParams: [1],
            pages: [
              {
                data: initialProjects,
                meta: initialMeta,
              },
            ],
          }
        : undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
  });

  // Handle filter changes with debouncing for search
  const handleFilterChange = useCallback(
    (key: keyof ProjectFilter, value: string) => {
      setFilter((prev) => ({
        ...prev,
        [key]: value === "all" ? undefined : value,
      }));
    },
    []
  );

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage &&
          !isLoading
        ) {
          fetchNextPage();
        }
      },
      {
        threshold: 1.0,
        rootMargin: "100px", // Start loading 100px before reaching the trigger
      }
    );

    const currentRef = observerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isLoading]);

  // Flatten all pages into a single array of projects
  const allProjects = data?.pages.flatMap((page) => page.data) || [];

  // Get total count from the first page's meta
  const totalCount = data?.pages[0]?.meta?.total || 0;

  // Error state
  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">
          {t("failedToLoad")} {error?.message || "Unknown error"}
        </p>
        <Button
          onClick={() => refetch()}
          variant="default"
        >
          {t("retry")}
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
            size={16}
          />
          <CustomInput
            id="search-projects"
            value={searchTerm}
            onChange={(value) => setSearchTerm(value)}
            placeholder={t("searchPlaceholder")}
            className="w-full pl-10 pr-4"
          />
        </div>
        <CustomSelect
          id="status"
          value={filter.status || undefined}
          onChange={(value) => handleFilterChange("status", value)}
          placeholder={t("filterByStatus")}
          options={statusOptions}
        />
        <CustomSelect
          id="type"
          value={filter.type || undefined}
          onChange={(value) => handleFilterChange("type", value)}
          placeholder={t("filterByType")}
          options={typeOptions}
        />
      </div>
      {/* Total Projects Count */}
      <div className="mb-4 text-gray-600 dark:text-gray-400">
        <span className="font-semibold">{t("total")}</span> {totalCount}
      </div>

      {/* Projects Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {allProjects.map((project) => (
          <ProjectCard project={project} key={project.id} />
        ))}

        {/* Loading indicator for fetching next page */}
        {isLoading && !allProjects.length && (
          <div className="col-span-full flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">
              {t("loading")}
            </span>
          </div>
        )}

        {/* Loading indicator for fetching next page */}
        {isFetchingNextPage && (
          <div className="col-span-full flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">
              {t("loadingMore")}
            </span>
          </div>
        )}

        {/* End message */}
        {!hasNextPage && allProjects.length > 0 && (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {t("endReached")}
            </p>
          </div>
        )}

        {/* No results message */}
        {allProjects.length === 0 && !isLoading && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {t("noResults")}
            </p>
          </div>
        )}
      </motion.div>

      {/* Intersection Observer trigger */}
      <div ref={observerRef} className="h-4" />
    </div>
  );
};
