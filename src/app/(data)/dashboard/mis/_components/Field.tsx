import { FieldError } from "react-hook-form";

type FieldProps = {
  label: string;
  name: string;
  register: any;
  inputClass: string;
  type?: string;
  error?: FieldError | undefined;
};

export const Field = ({
  label,
  name,
  register,
  inputClass,
  error,
  type = "text",
}: FieldProps) => (
  <div className="flex flex-col gap-1">
    <label htmlFor={name} className="text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      id={name}
      type={type}
      {...register(name)}
      className="input input-bordered w-full"
    />
    {error && <p className="text-error text-xs">{error.message}</p>}
  </div>
);
