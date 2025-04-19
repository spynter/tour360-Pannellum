import { ComponentType, SVGAttributes } from 'react';

declare module 'react-icons/fa' {
  export interface IconBaseProps extends SVGAttributes<SVGElement> {
    size?: string | number;
    color?: string;
    title?: string;
  }

  export type IconType = ComponentType<IconBaseProps>;

  export const FaTimes: IconType;
  export const FaPlus: IconType;
  export const FaTrash: IconType;
  export const FaSave: IconType;
  export const FaUpload: IconType;
  export const FaDownload: IconType;
  export const FaArrowRight: IconType;
  export const FaLink: IconType;
  export const FaGlobe: IconType;
}

declare module 'react-icons/md' {
  export interface IconBaseProps extends SVGAttributes<SVGElement> {
    size?: string | number;
    color?: string;
    title?: string;
  }

  export type IconType = ComponentType<IconBaseProps>;

  export const MdChevronLeft: IconType;
  export const MdChevronRight: IconType;
}

declare module 'react-icons' {
  export interface IconBaseProps extends SVGAttributes<SVGElement> {
    size?: string | number;
    color?: string;
    title?: string;
  }

  export type IconType = ComponentType<IconBaseProps>;
} 