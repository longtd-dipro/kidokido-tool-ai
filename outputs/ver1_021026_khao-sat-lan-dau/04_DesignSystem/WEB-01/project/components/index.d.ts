// window.KidoKidoAdmin — Admin site (管理画面) của KidoKido. 1 theme duy nhất `light` (data-theme="light"), không đổi theme.
import type { ReactNode, CSSProperties } from "react";

export type IconName =
  | "visibility" | "edit" | "delete" | "arrow-drop-down" | "navigate-before" | "navigate-next"
  | "add" | "add-circle" | "save-alt" | "keyboard-arrow-down" | "keyboard-arrow-up" | "clock" | "circle";

export interface IconProps { name: IconName; size?: number; label?: string; className?: string }
export declare function Icon(props: IconProps): JSX.Element;

export interface ButtonProps {
  variant?: "contained" | "outlined" | "add";
  size?: "md" | "lg";
  disabled?: boolean;
  startIcon?: IconName;
  endIcon?: IconName;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}
export declare function Button(props: ButtonProps): JSX.Element;

export interface TextFieldProps {
  label?: string;
  required?: boolean;
  boldLabel?: boolean;
  helper?: string;
  value?: string;
  placeholder?: string;
  endIcon?: IconName;
  pill?: boolean;
  disabled?: boolean;
  error?: string;
  style?: CSSProperties;
}
export declare function TextField(props: TextFieldProps): JSX.Element;

export interface SelectProps {
  label?: string;
  required?: boolean;
  boldLabel?: boolean;
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  style?: CSSProperties;
}
export declare function Select(props: SelectProps): JSX.Element;

export interface RadioProps { label?: string; required?: boolean; options: string[]; value?: string; column?: boolean }
export declare function Radio(props: RadioProps): JSX.Element;

export interface SwitchProps { checked?: boolean; label?: ReactNode }
export declare function Switch(props: SwitchProps): JSX.Element;

export interface TabsProps { items: string[]; value?: string }
export declare function Tabs(props: TabsProps): JSX.Element;

export interface CardProps { title?: string; style?: CSSProperties; children?: ReactNode }
export declare function Card(props: CardProps): JSX.Element;

export interface TableColumn { key: string; title: string; width?: number | string; numeric?: boolean }
export interface TableProps { columns: TableColumn[]; rows: Array<Record<string, ReactNode> & { locked?: boolean }> }
export declare function Table(props: TableProps): JSX.Element;

export interface PaginationProps { total: number; page?: number; pages?: number; perPage?: number; outlined?: boolean }
export declare function Pagination(props: PaginationProps): JSX.Element;

export interface BreadcrumbProps { items: string[] }
export declare function Breadcrumb(props: BreadcrumbProps): JSX.Element;

export interface PageHeaderProps { title: string; breadcrumb?: string[] }
export declare function PageHeader(props: PageHeaderProps): JSX.Element;

export interface SideNavItem { title: string; children?: string[] }
export interface SideNavProps { items: Array<string | SideNavItem>; active?: string; activeChild?: string }
export declare function SideNav(props: SideNavProps): JSX.Element;

export interface AppShellProps { nav: ReactNode; title?: string; breadcrumb?: string[]; children?: ReactNode }
export declare function AppShell(props: AppShellProps): JSX.Element;

export interface ModalProps {
  open?: boolean;
  title?: string;
  message?: string;
  cancelLabel?: string;
  okLabel?: string;
  onAccept?: () => void;
  onDismiss?: () => void;
}
export declare function Modal(props: ModalProps): JSX.Element | null;

export interface ToastProps { type?: "success" | "error" | "warning"; title?: string; message?: ReactNode }
export declare function Toast(props: ToastProps): JSX.Element;
