// window.KidoKidoUser — KidoKido 予約・購入サイト (WEB-02). 1 theme duy nhất `light` (đặt `data-theme="light"` trên <html>); site không có theme khác để đổi.
import type { ReactNode } from "react";

export type IconName =
  | "arrow-drop-down" | "visibility" | "radio-unchecked" | "radio-checked" | "navigate-before"
  | "navigate-next" | "favorite-border" | "checkbox" | "new-window" | "calendar" | "circular-progress";

export interface IconProps { name: IconName; size?: number; label?: string; className?: string }
export declare function Icon(props: IconProps): JSX.Element | null;

export interface ButtonProps {
  children: ReactNode; variant?: "solid" | "outline"; size?: "md" | "sm" | "hero"; disabled?: boolean;
  icon?: IconName; trailingIcon?: IconName; width?: string | number; type?: "button" | "submit"; onClick?: () => void;
}
export declare function Button(props: ButtonProps): JSX.Element;

export interface TextFieldProps {
  label?: string; required?: boolean; hint?: string; placeholder?: string; value?: string;
  type?: "text" | "email" | "password" | "tel" | "date"; error?: string; onChange?: (e: unknown) => void;
}
export declare function TextField(props: TextFieldProps): JSX.Element;

export interface SelectProps { outlined?: boolean; label?: string; required?: boolean; hint?: string; placeholder?: string; value?: string; error?: string }
export declare function Select(props: SelectProps): JSX.Element;

export interface SearchBarProps { label: string; placeholder?: string; value?: string; kind?: "keyword" | "select" }
export declare function SearchBar(props: SearchBarProps): JSX.Element;

export interface CheckboxProps { label: ReactNode; checked?: boolean }
export declare function Checkbox(props: CheckboxProps): JSX.Element;

export interface RadioProps { label?: string; options: string[]; value?: string }
export declare function Radio(props: RadioProps): JSX.Element;

export interface BadgeProps { children: ReactNode }
export declare function Badge(props: BadgeProps): JSX.Element;

export interface PaginationProps { count: number; page?: number }
export declare function Pagination(props: PaginationProps): JSX.Element;

export interface PageHeaderProps { title: string; subtitle?: string; variant?: "center" | "mypage" }
export declare function PageHeader(props: PageHeaderProps): JSX.Element;

export interface BreadcrumbProps { items: string[] }
export declare function Breadcrumb(props: BreadcrumbProps): JSX.Element;

export interface SideNavItem { label: string; icon?: IconName }
export interface SideNavProps { items: SideNavItem[]; active?: string; width?: string | number }
export declare function SideNav(props: SideNavProps): JSX.Element;

export interface AppHeaderProps { loggedIn?: boolean }
export declare function AppHeader(props: AppHeaderProps): JSX.Element;

export interface AppShellProps { loggedIn?: boolean; sideNav?: ReactNode; children?: ReactNode }
export declare function AppShell(props: AppShellProps): JSX.Element;

export interface CardProps { title?: string; tone?: "raised" | "tinted" | "disabled"; children?: ReactNode }
export declare function Card(props: CardProps): JSX.Element;
