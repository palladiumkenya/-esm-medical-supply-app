import React, { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import {
  type DefaultPatientWorkspaceProps,
  launchPatientWorkspace,
  useOrderBasket,
} from '@openmrs/esm-patient-common-lib';
import { translateFrom, useLayoutType, useSession, useConfig, ExtensionSlot } from '@openmrs/esm-framework';
import {
  Button,
  ButtonSet,
  Column,
  ComboBox,
  Form,
  Layer,
  Grid,
  InlineNotification,
  TextArea,
  NumberInput,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';

import { Controller, type FieldErrors, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { moduleName } from '../../../constants';
import { type MedicalSupplyConfig } from '../../../config-schema';
import styles from './medical-supply-form.scss';
import { type MedicalSupplyOrderBasketItem } from '../../../types';
import { priorityOptions } from './medical-supply-order';
import { useMedicalSupplyTypes } from '../../../hooks/useMedicalSupplyTypes';
import { careSettingUuid, prepMedicalSupplyOrderPostData } from '../api';

export interface MedicalSupplyOrderFormProps {
  initialOrder: MedicalSupplyOrderBasketItem;
  closeWorkspace: DefaultPatientWorkspaceProps['closeWorkspace'];
  closeWorkspaceWithSavedChanges: DefaultPatientWorkspaceProps['closeWorkspaceWithSavedChanges'];
  promptBeforeClosing: DefaultPatientWorkspaceProps['promptBeforeClosing'];
}

// Designs:
//   https://app.zeplin.io/project/60d5947dd636aebbd63dce4c/screen/640b06c440ee3f7af8747620
//   https://app.zeplin.io/project/60d5947dd636aebbd63dce4c/screen/640b06d286e0aa7b0316db4a
export function MedicalSupplyOrderForm({
  initialOrder,
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
  promptBeforeClosing,
}: MedicalSupplyOrderFormProps) {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const session = useSession();
  const { orders, setOrders } = useOrderBasket<MedicalSupplyOrderBasketItem>(
    'medicalsupply',
    prepMedicalSupplyOrderPostData,
  );
  const { medicalSupplyTypes, isLoading: isLoadingTestTypes, error: errorLoadingTestTypes } = useMedicalSupplyTypes();
  const [showErrorNotification, setShowErrorNotification] = useState(false);

  const config = useConfig<MedicalSupplyConfig>();

  const medicalSupplyOrderFormSchema = z.object({
    instructions: z.string().optional(),
    urgency: z.string().refine((value) => value !== '', {
      message: translateFrom(moduleName, 'addMedicalSupplyOrderPriorityRequired', 'Priority is required'),
    }),
    testType: z.object(
      { label: z.string(), conceptUuid: z.string() },
      {
        required_error: translateFrom(
          moduleName,
          'addMedOrderMedicalSupplyTypeRequired',
          'Medical supply type is required',
        ),
      },
    ),
    scheduleDate: z.union([z.string(), z.date(), z.string().optional()]),
    commentsToFulfiller: z.string().optional(),
    quantityUnits: z.string().optional(),
    quantity: z.number().refine((value) => value !== null && value !== undefined && value > 0, {
      message: translateFrom(moduleName, 'quantityRequired', 'Quantity is required'),
    }),
  });

  const {
    control,
    handleSubmit,
    formState: { errors, defaultValues, isDirty },
  } = useForm<MedicalSupplyOrderBasketItem>({
    mode: 'all',
    resolver: zodResolver(medicalSupplyOrderFormSchema),
    defaultValues: {
      ...initialOrder,
    },
  });

  const handleFormSubmission = useCallback(
    (data: MedicalSupplyOrderBasketItem) => {
      data.action = 'NEW';
      data.careSetting = careSettingUuid;
      data.orderer = session.currentProvider.uuid;
      const newOrders = [...orders];
      const existingOrder = orders.find((order) => order.testType.conceptUuid == defaultValues.testType.conceptUuid);
      const orderIndex = existingOrder ? orders.indexOf(existingOrder) : orders.length;
      newOrders[orderIndex] = data;
      setOrders(newOrders);
      closeWorkspaceWithSavedChanges({
        onWorkspaceClose: () => launchPatientWorkspace('order-basket'),
      });
    },
    [orders, setOrders, session?.currentProvider?.uuid, defaultValues, closeWorkspaceWithSavedChanges],
  );

  const cancelOrder = useCallback(() => {
    setOrders(orders.filter((order) => order.testType.conceptUuid !== defaultValues.testType.conceptUuid));
    closeWorkspace({
      onWorkspaceClose: () => launchPatientWorkspace('order-basket'),
    });
  }, [closeWorkspace, orders, setOrders, defaultValues]);

  const onError = (errors: FieldErrors<MedicalSupplyOrderBasketItem>) => {
    if (errors) {
      setShowErrorNotification(true);
    }
  };

  useEffect(() => {
    promptBeforeClosing(() => isDirty);
  }, [isDirty, promptBeforeClosing]);

  const [showScheduleDate, setShowScheduleDate] = useState(false);

  return (
    <>
      {errorLoadingTestTypes && (
        <InlineNotification
          kind="error"
          lowContrast
          className={styles.inlineNotification}
          title={t('errorLoadingMedicalSupplyTypes', 'Error occurred when loading medical supply types')}
          subtitle={t('tryReopeningTheForm', 'Please try launching the form again')}
        />
      )}
      <Form
        className={styles.orderForm}
        onSubmit={handleSubmit(handleFormSubmission, onError)}
        id="medicalSupplyOrderForm"
      >
        <div className={styles.form}>
          <ExtensionSlot name="top-of-imaging-order-form-slot" state={{ order: initialOrder }} />

          <Grid className={styles.gridRow}>
            <Column lg={16} md={8} sm={4}>
              <InputWrapper>
                <Controller
                  name="testType"
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <ComboBox
                      size="lg"
                      id="medicalSupplyTypeInput"
                      titleText={t('medicalSupplyType', 'Medical supply type')}
                      selectedItem={value}
                      items={''}
                      placeholder={
                        isLoadingTestTypes
                          ? `${t('loading', 'Loading')}...`
                          : t('medicalSupplyTypePlaceholder', 'Select one')
                      }
                      onBlur={onBlur}
                      disabled={isLoadingTestTypes}
                      onChange={({ selectedItem }) => onChange(selectedItem)}
                      invalid={errors.testType?.message}
                      invalidText={errors.testType?.message}
                    />
                  )}
                />
              </InputWrapper>
            </Column>
          </Grid>
          <Grid className={styles.gridRow}>
            <Column lg={8} md={8} sm={4}>
              <InputWrapper>
                <Controller
                  name="urgency"
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <ComboBox
                      size="lg"
                      id="priorityInput"
                      titleText={t('priority', 'Priority')}
                      selectedItem={priorityOptions.find((option) => option.value === value) || null}
                      items={priorityOptions}
                      onBlur={onBlur}
                      onChange={({ selectedItem }) => {
                        onChange(selectedItem?.value || '');
                        setShowScheduleDate(selectedItem?.label === 'Scheduled');
                      }}
                      invalid={errors.urgency?.message}
                      invalidText={errors.urgency?.message}
                    />
                  )}
                />
              </InputWrapper>
            </Column>
          </Grid>
          <Grid className={styles.gridRow}>
            <Column lg={16} md={8} sm={4}>
              <InputWrapper>
                <Controller
                  name="quantity"
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <NumberInput
                      enableCounter
                      id="quantityInput"
                      size="lg"
                      label={t('quantity', 'Quantity')}
                      value={value}
                      onChange={onChange}
                      onBlur={onBlur}
                      min={0}
                      invalid={errors.quantity?.message}
                      invalidText={errors.quantity?.message}
                    />
                  )}
                />
              </InputWrapper>
            </Column>
          </Grid>
          <Grid className={styles.gridRow}>
            <Column lg={8} md={8} sm={4}>
              <InputWrapper>
                <Controller
                  name="quantityUnits"
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <ComboBox
                      size="lg"
                      id="quantityUnits"
                      titleText={t('quantityUnits', 'Quantity Units')}
                      selectedItem={priorityOptions.find((option) => option.value === value) || null} // TODO: replace with actual units
                      items={priorityOptions}
                      onBlur={onBlur}
                      onChange={({ selectedItem }) => {
                        onChange(selectedItem?.value || '');
                      }}
                    />
                  )}
                />
              </InputWrapper>
            </Column>
          </Grid>
          <Grid className={styles.gridRow}>
            <Column lg={16} md={8} sm={4}>
              <InputWrapper>
                <Controller
                  name="instructions"
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextArea
                      enableCounter
                      id="additionalInstructionsInput"
                      size="lg"
                      labelText={t('additionalInstructions', 'Additional instructions')}
                      value={value}
                      onChange={onChange}
                      onBlur={onBlur}
                      maxCount={500}
                      invalid={errors.instructions?.message}
                      invalidText={errors.instructions?.message}
                    />
                  )}
                />
              </InputWrapper>
            </Column>
          </Grid>
        </div>
        <div>
          {showErrorNotification && (
            <Column className={styles.errorContainer}>
              <InlineNotification
                lowContrast
                title={t('error', 'Error')}
                subtitle={t('pleaseRequiredFields', 'Please fill all required fields') + '.'}
                onClose={() => setShowErrorNotification(false)}
              />
            </Column>
          )}
          <ButtonSet
            className={classNames(styles.buttonSet, isTablet ? styles.tabletButtonSet : styles.desktopButtonSet)}
          >
            <Button className={styles.button} kind="secondary" onClick={cancelOrder} size="xl">
              {t('discard', 'Discard')}
            </Button>
            <Button className={styles.button} kind="primary" type="submit" size="xl">
              {t('saveOrder', 'Save order')}
            </Button>
          </ButtonSet>
        </div>
      </Form>
    </>
  );
}

function InputWrapper({ children }) {
  const isTablet = useLayoutType() === 'tablet';
  return (
    <Layer level={isTablet ? 1 : 0}>
      <div className={styles.field}>{children}</div>
    </Layer>
  );
}
