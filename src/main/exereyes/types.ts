export interface BodyRegion {
  id: number;
  name: string;
}

export interface Equipment {
  id: number;
  name: string;
}

export const REGION_IMAGES: Record<string, number> = {
  leg: require('../../assets/images/body_regions/leg.png'),
  arm: require('../../assets/images/body_regions/arm.png'),
  abdomen: require('../../assets/images/body_regions/abdomen.png'),
  back: require('../../assets/images/body_regions/back.png'),
  chest: require('../../assets/images/body_regions/chest.png'),
  shoulder: require('../../assets/images/body_regions/shoulder.png'),
  default: require('../../assets/images/body_regions/leg.png'),
};
