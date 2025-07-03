interface Props {
  variant?: "error" | "success";
  children?: React.ReactNode;
}

export const Message = ({ variant, children }: Props) => {
  if (variant === "success") {
    return <p className="text-green-500 mb-4">{children}</p>;
  }
  return <p className="text-red-500 mb-4">{children}</p>;
};
