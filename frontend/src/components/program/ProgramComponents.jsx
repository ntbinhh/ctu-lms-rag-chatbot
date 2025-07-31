import React from 'react';
import { Skeleton } from 'primereact/skeleton';
import { Button } from 'primereact/button';

export const FilterStepSkeleton = ({ count = 3, width = "150px" }) => (
  <div className="faculty-skeleton">
    {Array.from({ length: count }, (_, i) => (
      <Skeleton key={i} width={width} height="2.5rem" className="mr-2 mb-2" />
    ))}
  </div>
);

export const StepLabel = ({ number, children }) => (
  <label className="step-label">
    <span className="step-number">{number}</span>
    {children}
  </label>
);

export const StatItem = ({ number, label }) => (
  <div className="stat-item">
    <span className="stat-number">{number}</span>
    <span className="stat-label">{label}</span>
  </div>
);

export const EmptyState = ({ icon = "pi-inbox", title, description, actionLabel, onAction }) => (
  <div className="empty-content">
    <i className={`pi ${icon} empty-icon`}></i>
    <h3>{title}</h3>
    {description && <p>{description}</p>}
    {actionLabel && onAction && (
      <Button
        label={actionLabel}
        icon="pi pi-refresh"
        onClick={onAction}
        className="p-button-outlined"
      />
    )}
  </div>
);
