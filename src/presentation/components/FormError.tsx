export interface FormErrorProps {
  readonly message: string | null;
}

export const FormError = ({ message }: FormErrorProps) =>
  message ? (
    <p role="alert" className="text-[13px] leading-5 text-failure">
      {message}
    </p>
  ) : null;
