import {
  getAsyncLifecycle,
  defineConfigSchema,
  getSyncLifecycle,
  translateFrom,
} from "@openmrs/esm-framework";
import { configSchema } from "./config-schema";
import MedicalSupplyOrderBasketPanelExtension from "./form/add-medical-supply-order/medical-supply-order-basket-panel/medical-supply-order-basket-panel.extension";

//import { createLeftPanelLink } from "./left-panel-link";

const moduleName = "@openmrs/esm-medical-supply-app";

const options = {
  featureName: "openmrs/esm-medical-supply-app",
  moduleName,
};

export const importTranslation = require.context(
  "../translations",
  false,
  /.json$/,
  "lazy"
);

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const root = getAsyncLifecycle(
  () => import("./root.component"),
  options
);



export const medicalSupplyOrderPanel = getSyncLifecycle(
  MedicalSupplyOrderBasketPanelExtension,
  options
);

// t('addMedicalSupplyOrderWorkspaceTitle', 'Add Medical Supply order')

export const addMedicalSupplyOrderWorkspace = getAsyncLifecycle(
  () =>
    import(
      "./form/add-medical-supply-order/medical-supply-order/add-medical-supply-order.workspace"
    ),
  options
);
