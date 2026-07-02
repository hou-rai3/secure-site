import React from "react";
import { ReactNode, ComponentPropsWithRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const button = tv({
  base: "flex min-h-12 items-center justify-center rounded-md border border-emerald-600 bg-emerald-500 px-5 py-3 text-base font-bold text-white shadow-md shadow-emerald-900/15 transition-colors hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-300",
  variants: {
    variant: {
      indigo: "bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-300",
    },
    width: {
      auto: "",
      stretch: "w-full",
      slim: "min-h-10 px-4 py-2",
    },
    disabled: {
      true: "cursor-not-allowed opacity-50",
    },
    isBusy: {
      true: "cursor-wait opacity-70",
    },
  },
  defaultVariants: {
    variant: "indigo",
    width: "auto",
    disabled: false,
    isBusy: false,
  },
});

interface Props
  extends Omit<ComponentPropsWithRef<"button">, "className">,
    VariantProps<typeof button> {
  children?: ReactNode;
  className?: string;
  isBusy?: boolean;
}

export const Button = (props: Props) => {
  const { children, variant, width, disabled, isBusy, className, ...rest } =
    props;

  return (
    <button
      className={button({ variant, width, disabled, isBusy, class: className })}
      disabled={disabled || isBusy}
      {...rest}
    >
      <div>
        {isBusy && (
          <FontAwesomeIcon icon={faSpinner} className="mr-2 animate-spin" />
        )}
        {children}
        {isBusy && <span> 処理中...</span>}
      </div>
    </button>
  );
};
