type ZodErrorItem = {
  path: (string | number)[];
  message: string;
};

export function zodErrorsToMap(errors: ZodErrorItem[]): Map<string, string> {
  const errorMap = new Map<string, string>();

  for (const error of errors) {
    const path = error.path.join(".");
    errorMap.set(path, error.message);
  }

  return errorMap;
}
