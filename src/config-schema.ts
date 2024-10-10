import { Type } from "@openmrs/esm-framework";

export const configSchema = {
  medicalSupplyConceptSetUuid: {
    _type: Type.String,
    _description: "Medical Supply Concept SET UUID",
    _default: "164068AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  },
  orders: {
    medicalSupplyOrderTypeUuid: {
      _type: Type.UUID,
      _description: "UUID for the 'Medical Supply' order type",
      _default: "dab3ab30-2feb-48ec-b4af-8332a0831b49",
    },
    medicalSupplyOrderableConcepts: {
      _type: Type.Array,
      _description:
        "UUIDs of concepts that represent orderable medical supply. If an empty array `[]` is provided, every concept with class `Medical supply` will be considered orderable.",
      _elements: {
        _type: Type.UUID,
      },
      _default: [],
    },
  },
};

interface OrderReason {
  labTestUuid: string;
  required: boolean;
  orderReasons: Array<string>;
}
export type MedicalSupplyConfig = {
  medicalSupplyConceptSetUuid: string;
  orders: {
    medicalSupplyOrderableConcepts: Array<string>;
    medicalSupplyOrderTypeUuid: string;
  };
  labTestsWithOrderReasons: Array<OrderReason>;
};
