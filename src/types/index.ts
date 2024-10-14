import { type OrderBasketItem } from '@openmrs/esm-patient-common-lib';

export interface Concept {
  uuid: string;
  display: string;
  conceptClass: {
    uuid: string;
    display: string;
    name: string;
  };
  answers: [];
  setMembers: [];
  hiNormal: number;
  hiAbsolute: number;
  hiCritical: number;
  lowNormal: number;
  lowAbsolute: number;
  lowCritical: number;
  units: string;
  allowDecimal: boolean;
  displayPrecision: null;
  attributes: [];
}

export interface MedicalSupplyOrderBasketItem extends OrderBasketItem {
  testType?: {
    label: string;
    conceptUuid: string;
  };
  urgency?: string;
  instructions?: string;
  orderReason?: string;
  scheduleDate?: Date | string;
  quantity?: number;
  quantityUnits?: string;
}

export type OrderFrequency = CommonMedicalSupplyValueCoded;
export type DurationUnit = CommonMedicalSupplyValueCoded;

interface CommonMedicalSupplyProps {
  value: string;
  default?: boolean;
}

export interface CommonMedicalSupplyValueCoded extends CommonMedicalSupplyProps {
  valueCoded: string;
}

export interface Concept {
  display: string;
  uuid: string;
}
