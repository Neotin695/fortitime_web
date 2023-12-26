import { Combobox, Transition } from "@headlessui/react";
import AnchorDownIcon from "@/assets/icons/anchor-down";
import React, { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import fetcher from "@/lib/fetcher";
import { useDebounce } from "@/hook/use-debounce";
import { useQuery } from "@tanstack/react-query";
import { buildUrlQueryParams } from "@/utils/build-url-query-params";
import { Paginate, ParamsType } from "@/types/global";
import clsx from "clsx";
import CheckIcon from "@/assets/icons/check";
import EmptyCheckIcon from "@/assets/icons/empty-check";
import { LoadingCard } from "@/components/loading";

const sizes = {
  large: "py-[19px]",
  medium: "py-[11px]",
};

interface AsyncSelectFieldProps<T extends { id: number }> {
  value?: T;
  label?: string;
  onSelect: (value: T) => void;
  extractTitle: (value?: T) => string;
  extractKey: (value: T) => string | number;
  queryKey?: string;
  status?: "default" | "error" | "success";
  queryParams?: ParamsType;
  size?: keyof typeof sizes;
  disabled?: boolean;
  error?: string;
  required?: boolean;
}

export const AsyncSelect = <T extends { id: number }>({
  value,
  onSelect,
  extractKey,
  extractTitle,
  label,
  queryKey,
  status = "default",
  queryParams,
  size = "large",
  disabled,
  error,
  required,
}: AsyncSelectFieldProps<T>) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const debouncedQuery = useDebounce(query);
  const { data: options, isLoading } = useQuery({
    queryKey: [queryKey, debouncedQuery, queryParams],
    queryFn: () =>
      fetcher<Paginate<T>>(
        buildUrlQueryParams(queryKey as string, { search: debouncedQuery, ...queryParams })
      ),
    enabled: !!queryKey && isInputFocused,
    staleTime: Infinity,
  });

  return (
    <Combobox
      disabled={disabled}
      value={value}
      onChange={onSelect}
      by={(a, b) => extractKey(a) === extractKey(b)}
    >
      <div className="relative ">
        {!!label && (
          <Combobox.Label className="text-sm">
            {t(label)}
            {required && "*"}:
          </Combobox.Label>
        )}
        <div className="relative w-full cursor-default  text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
          <Combobox.Input
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            className={clsx(
              "block px-4  w-full text-sm bg-transparent rounded-2xl border appearance-none focus:outline-none focus:ring-0  peer",
              status === "default" && "border-gray-inputBorder focus-visible:border-primary",
              status === "error" && "border-badge-product focus-visible:border-red-700",
              status === "success" && "border-green-500 focus-visible:border-red-700",
              sizes[size],
              disabled && "text-gray-field cursor-not-allowed"
            )}
            displayValue={extractTitle}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Combobox.Button
            className={clsx(
              "absolute inset-y-0 right-0 rtl:left-1  rtl:right-auto flex items-center pr-2",
              disabled && "text-gray-field"
            )}
          >
            <AnchorDownIcon className="h-5 w-5 " aria-hidden="true" />
          </Combobox.Button>
        </div>
        {!!error && (
          <p role="alert" className="text-sm text-red mt-1">
            {error}
          </p>
        )}
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => setQuery("")}
        >
          <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-dark py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-20">
            {/* eslint-disable-next-line */}
            {isLoading ? (
              <LoadingCard />
            ) : options?.data?.length === 0 || query !== "" ? (
              <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                {t("nothing.found")}
              </div>
            ) : (
              options?.data?.map((option, i) => (
                <Combobox.Option
                  key={extractKey(option)}
                  className={({ active }) =>
                    `relative cursor-default font-medium select-none py-4 flex items-center gap-2.5 px-5 ${
                      active ? "bg-gray-100 dark:bg-gray-bold" : ""
                    } ${i !== 0 && "border-t border-gray-inputBorder"}`
                  }
                  value={option}
                >
                  {({ selected }) => (
                    <>
                      {selected ? (
                        <div className="text-primary dark:text-white">
                          <CheckIcon />
                        </div>
                      ) : (
                        <div className="text-gray-field">
                          <EmptyCheckIcon />
                        </div>
                      )}
                      <span
                        className={`block truncate ${selected ? "font-medium" : "font-normal"}`}
                      >
                        {extractTitle(option)}
                      </span>
                    </>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  );
};
