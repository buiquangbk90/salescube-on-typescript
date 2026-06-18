'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCustomerSchema, type CreateCustomerInput } from '@salescube/shared';

interface Props {
  defaultValues?: Partial<CreateCustomerInput>;
  onSubmit: (values: CreateCustomerInput) => Promise<void> | void;
  submitLabel: string;
  disabled?: boolean;
  /** When true, hide / disable the `code` field (for edit mode) */
  lockCode?: boolean;
}

export function CustomerForm({ defaultValues, onSubmit, submitLabel, disabled, lockCode }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateCustomerInput>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: {
      taxShift: 'EXCLUDED',
      taxFraction: 'FLOOR',
      priceFraction: 'FLOOR',
      paybackCycle: 'NEXT_MONTH',
      ...defaultValues,
    },
  });

  return (
    <form
      onSubmit={handleSubmit(async (v) => {
        await onSubmit(v);
      })}
      className="space-y-6"
    >
      <Section title="Thông tin cơ bản">
        <Field label="Mã khách hàng *" error={errors.code?.message}>
          <input
            {...register('code')}
            disabled={lockCode}
            className="input"
            placeholder="VD: C001"
          />
        </Field>
        <Field label="Tên khách hàng *" error={errors.name?.message}>
          <input {...register('name')} className="input" />
        </Field>
        <Field label="Tên Katakana" error={errors.nameKana?.message}>
          <input {...register('nameKana')} className="input" placeholder="シノニム" />
        </Field>
        <Field label="Tên viết tắt" error={errors.abbr?.message}>
          <input {...register('abbr')} className="input" />
        </Field>
      </Section>

      <Section title="Địa chỉ & Liên lạc">
        <Field label="Mã bưu điện" error={errors.zipCode?.message}>
          <input {...register('zipCode')} className="input" />
        </Field>
        <Field label="Địa chỉ 1" error={errors.address1?.message}>
          <input {...register('address1')} className="input" />
        </Field>
        <Field label="Địa chỉ 2" error={errors.address2?.message}>
          <input {...register('address2')} className="input" />
        </Field>
        <Field label="Người liên hệ" error={errors.contactName?.message}>
          <input {...register('contactName')} className="input" />
        </Field>
        <Field label="Điện thoại" error={errors.phone?.message}>
          <input {...register('phone')} className="input" />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <input {...register('email')} className="input" type="email" />
        </Field>
      </Section>

      <Section title="Quy tắc thanh toán">
        <Field label="Cách tính thuế" error={errors.taxShift?.message}>
          <select {...register('taxShift')} className="input">
            <option value="EXCLUDED">外税 (chưa gồm thuế)</option>
            <option value="INCLUDED">内税 (đã gồm thuế)</option>
          </select>
        </Field>
        <Field label="Làm tròn thuế" error={errors.taxFraction?.message}>
          <select {...register('taxFraction')} className="input">
            <option value="FLOOR">Làm tròn xuống</option>
            <option value="CEIL">Làm tròn lên</option>
            <option value="ROUND">Làm tròn gần nhất</option>
          </select>
        </Field>
        <Field label="Nhóm chốt" error={errors.cutoffGroup?.message}>
          <input {...register('cutoffGroup')} className="input" />
        </Field>
        <Field label="Ngày chốt (1-31, 31=cuối tháng)" error={errors.cutoffDay?.message}>
          <input
            {...register('cutoffDay', { valueAsNumber: true })}
            className="input"
            type="number"
            min={1}
            max={31}
          />
        </Field>
        <Field label="Chu kỳ thanh toán" error={errors.paybackCycle?.message}>
          <select {...register('paybackCycle')} className="input">
            <option value="CURRENT_MONTH">Trong tháng (当月)</option>
            <option value="NEXT_MONTH">Tháng sau (翌月)</option>
            <option value="AFTER_NEXT_MONTH">Tháng sau nữa (翌々月)</option>
            <option value="MONTHS_3">3 tháng sau</option>
          </select>
        </Field>
      </Section>

      <Section title="Ghi chú">
        <Field label="Remarks" error={errors.remarks?.message} fullWidth>
          <textarea
            {...register('remarks')}
            className="input min-h-[80px]"
            rows={3}
          />
        </Field>
      </Section>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={disabled || isSubmitting}
          className="rounded bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isSubmitting ? 'Đang lưu...' : submitLabel}
        </button>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 0.375rem;
          border: 1px solid #d1d5db;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          background: white;
        }
        .input:focus {
          outline: none;
          border-color: #3b82f6;
        }
        .input:disabled {
          background: #f3f4f6;
          color: #6b7280;
        }
      `}</style>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded border border-gray-200 bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">{title}</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
  fullWidth,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <label className={`block ${fullWidth ? 'md:col-span-2' : ''}`}>
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
