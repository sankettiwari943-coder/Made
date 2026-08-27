import React from 'react';
import clsx from 'clsx';
import styles from './SectionHeading.module.css';

interface SectionHeadingProps {
  index?: string;
  label?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  index,
  label,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div className={clsx(styles.wrapper, className)}>
      <div className={styles.headerRow}>
        <div>
          {(index || label) && (
            <div className={styles.labelWrapper}>
              {index && <span className={styles.technicalIndex}>{index}</span>}
              {index && label && <span className={styles.labelDivider} />}
              {label && <span className={styles.categoryLabel}>{label}</span>}
            </div>
          )}
          <h2 className={styles.title}>{title}</h2>
          {description && <p className={styles.description}>{description}</p>}
        </div>
        {action && <div className={styles.actionWrapper}>{action}</div>}
      </div>
    </div>
  );
};
