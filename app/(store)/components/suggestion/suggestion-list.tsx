import React from "react";
import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/product";
import { SuggestionCard } from "./suggestion-card";

const SuggestionList = () => {
  const { data } = useQuery(["suggestions"], () => productService.getAll({ perPage: 4 }));
  return (
    <div className="flex flex-col lg:gap-5 gap-2">
      {data?.data?.map((product) => (
        <SuggestionCard key={product.id} data={product} />
      ))}
    </div>
  );
};

export default SuggestionList;
