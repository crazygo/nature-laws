import { Preset } from "./types";

import cubeData from "../../presets/cube.json";
import plankData from "../../presets/plank.json";
import ballSoccerData from "../../presets/ball-soccer.json";
import ballBasketballData from "../../presets/ball-basketball.json";
import rampData from "../../presets/ramp.json";
import springboardData from "../../presets/springboard.json";
import fixedPlatformData from "../../presets/fixed-platform.json";
import wallData from "../../presets/wall.json";
import hingeData from "../../presets/hinge.json";
import elasticRopeData from "../../presets/elastic-rope.json";
import switchTriggerData from "../../presets/switch-trigger.json";
import conveyorBeltData from "../../presets/conveyor-belt.json";
import magnetData from "../../presets/magnet.json";
import gearData from "../../presets/gear.json";
import oneWayGateData from "../../presets/one-way-gate.json";
import gravityZoneData from "../../presets/gravity-zone.json";
import legoFigureData from "../../presets/lego-figure.json";

export const PRESETS: Preset[] = [
  cubeData,
  plankData,
  ballSoccerData,
  ballBasketballData,
  rampData,
  springboardData,
  fixedPlatformData,
  wallData,
  hingeData,
  elasticRopeData,
  switchTriggerData,
  conveyorBeltData,
  magnetData,
  gearData,
  oneWayGateData,
  gravityZoneData,
  legoFigureData,
] as Preset[];

export const PRESET_CATEGORIES: Record<string, string> = {
  basic: "Basic Shapes",
  ball: "Balls",
  surface: "Surfaces",
  structure: "Structures",
  constraint: "Constraints",
  mechanism: "Mechanisms",
  figure: "Figures",
};
