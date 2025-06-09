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
  <div className="flex flex-col">
    <label htmlFor={name} className="mb-1 font-medium">
      {label}
    </label>
    <input id={name} type={type} {...register(name)} className={inputClass} />

    {error && <p className="text-red-400">{error.message}</p>}
  </div>
);
