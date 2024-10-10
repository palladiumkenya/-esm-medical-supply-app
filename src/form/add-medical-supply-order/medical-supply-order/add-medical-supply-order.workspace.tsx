import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import capitalize from 'lodash-es/capitalize';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { ArrowLeft } from '@carbon/react/icons';
import { age, formatDate, parseDate, useLayoutType, usePatient } from '@openmrs/esm-framework';
import {type DefaultPatientWorkspaceProps, launchPatientWorkspace} from '@openmrs/esm-patient-common-lib';
import { TestTypeSearch } from './medical-supply-type-search';
import { MedicalSupplyOrderForm } from './medical-supply-form.component';
import styles from './add-medical-supply-order.scss';
import { type MedicalSupplyOrderBasketItem } from '../../../types';

export interface AddMedicalSupplyOrderWorkspaceAdditionalProps {
  order?: MedicalSupplyOrderBasketItem;
}

export interface AddMedicalSupplyOrderWorkspace
  extends DefaultPatientWorkspaceProps,
    AddMedicalSupplyOrderWorkspaceAdditionalProps {}

export default function AddMedicalSupplyOrderWorkspace({
  order: initialOrder,
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
  promptBeforeClosing,
}: AddMedicalSupplyOrderWorkspace) {
  const { t } = useTranslation();

  const { patient, isLoading: isLoadingPatient } = usePatient();
  const [currentMedicalSupplyOrder, setCurrentMedicalSupplyOrder] = useState(
    initialOrder as MedicalSupplyOrderBasketItem,
  );

  const isTablet = useLayoutType() === 'tablet';

  const patientName = `${patient?.name?.[0]?.given?.join(' ')} ${patient?.name?.[0].family}`;

  const cancelOrder = useCallback(() => {
    closeWorkspace({
      ignoreChanges: true,
      onWorkspaceClose: () => launchPatientWorkspace('order-basket'),
    });
  }, [closeWorkspace]);

  return (
    <div className={styles.container}>
      {isTablet && !isLoadingPatient && (
        <div className={styles.patientHeader}>
          <span className={styles.bodyShort02}>{patientName}</span>
          <span className={classNames(styles.text02, styles.bodyShort01)}>
            {capitalize(patient?.gender)} &middot; {age(patient?.birthDate)} &middot;{' '}
            <span>
              {formatDate(parseDate(patient?.birthDate), {
                mode: 'wide',
                time: false,
              })}
            </span>
          </span>
        </div>
      )}
      {!isTablet && (
        <div className={styles.backButton}>
          <Button
            kind="ghost"
            renderIcon={(props) => <ArrowLeft size={24} {...props} />}
            iconDescription="Return to order basket"
            size="sm"
            onClick={cancelOrder}
          >
            <span>{t('backToOrderBasket', 'Back to order basket')}</span>
          </Button>
        </div>
      )}
      {!currentMedicalSupplyOrder ? (
        <TestTypeSearch openLabForm={setCurrentMedicalSupplyOrder} />
      ) : (
        <MedicalSupplyOrderForm
          initialOrder={currentMedicalSupplyOrder}
          closeWorkspace={closeWorkspace}
          closeWorkspaceWithSavedChanges={closeWorkspaceWithSavedChanges}
          promptBeforeClosing={promptBeforeClosing}
        />
      )}
    </div>
  );
}
