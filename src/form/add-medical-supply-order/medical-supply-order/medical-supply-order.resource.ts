import useSWR from "swr";
import { openmrsFetch, restBaseUrl } from "@openmrs/esm-framework";
import {type Concept } from "../../../types";
import { type MedicalSupplyType } from "../../../hooks/useMedicalSupplyTypes";

export function useMedicalSupplyConceptsByName(searchTerm: string, medicalSupplyConceptClass: string) {
    const customRepresentation = 'custom:(uuid,display)';
    const url = `${restBaseUrl}/concept?name=${searchTerm}&searchType=fuzzy&class=${medicalSupplyConceptClass}&v=${customRepresentation}`;
    const { data, error, isLoading } = useSWR<
    { data: { results: Array<MedicalSupplyType> } },
    Error
  >(url, openmrsFetch);

  return {
    searchResults: data?.data?.results ?? [],
    error: error,
    isSearching: isLoading,
  };
  
    //return openmrsFetch<Array<Concept>>(url).then(({ data }) => Promise.resolve(data['results']));
  }