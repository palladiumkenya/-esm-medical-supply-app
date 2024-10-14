import { useEffect, useMemo } from 'react';
import useSWRImmutable from 'swr/immutable';
import fuzzy from 'fuzzy';
import { type FetchResponse, openmrsFetch, useConfig, restBaseUrl, reportError } from '@openmrs/esm-framework';

import { type MedicalSupplyConfig } from '../config-schema';
import {type Concept } from '../types';

type ConceptResult = FetchResponse<Concept>;
type ConceptResults = FetchResponse<{ setMembers: Array<Concept> }>;

export interface MedicalSupplyType {
  label: string;
  conceptUuid: string;
}

export interface UseMedicalSupplyType {
  medicalSupplyTypes: Array<MedicalSupplyType>;
  isLoading: boolean;
  error: Error;
}

function openmrsFetchMultiple(urls: Array<string>) {
  // SWR has an RFC for `useSWRList`:
  // https://github.com/vercel/swr/discussions/1988
  // If that ever is implemented we should switch to using that.
  return Promise.all(urls.map((url) => openmrsFetch<{ results: Array<Concept> }>(url)));
}

function useMedicalSupplyConceptsSWR(medicalSupplyOrderableConcepts?: Array<string>) {
  const config = useConfig<MedicalSupplyConfig>();
  const { data, isLoading, error } = useSWRImmutable(
    () =>
        medicalSupplyOrderableConcepts
        ? medicalSupplyOrderableConcepts.map((c) => `${restBaseUrl}/concept/${c}`)
        : `${restBaseUrl}/concept/${config.medicalSupplyConceptSetUuid}?v=custom:setMembers`,
    (medicalSupplyOrderableConcepts ? openmrsFetchMultiple : openmrsFetch) as any,
    {
      shouldRetryOnError(err) {
        return err instanceof Response;
      },
    },
  );

  const results = useMemo(() => {
    if (isLoading || error) return null;
    return medicalSupplyOrderableConcepts
      ? (data as Array<ConceptResult>)?.flatMap((d) => d.data.setMembers)
      : (data as ConceptResults)?.data.setMembers ?? ([] as Concept[]);
  }, [data, isLoading, error, medicalSupplyOrderableConcepts]);

  return {
    data: results,
    isLoading,
    error,
  };
}

export function useMedicalSupplyTypes(searchTerm = ''): UseMedicalSupplyType {
  const { medicalSupplyOrderableConcepts } = useConfig<MedicalSupplyConfig>().orders;

  const { data, isLoading, error } = useMedicalSupplyConceptsSWR(medicalSupplyOrderableConcepts.length ? medicalSupplyOrderableConcepts : null);

  useEffect(() => {
    if (error) {
      reportError(error);
    }
  }, [error]);

  const testConcepts = useMemo(() => {
    return data?.map((concept) => ({
      label: concept.display,
      conceptUuid: concept.uuid,
    }));
  }, [data]);

  const filteredMedicalSupplyTypes = useMemo(() => {
    return searchTerm && !isLoading && !error
      ? fuzzy.filter(searchTerm, testConcepts, { extract: (c) => c.label }).map((result) => result.original)
      : testConcepts;
  }, [testConcepts, searchTerm, error, isLoading]);

  return {
    medicalSupplyTypes: filteredMedicalSupplyTypes,
    isLoading: isLoading,
    error: error,
  };
}
