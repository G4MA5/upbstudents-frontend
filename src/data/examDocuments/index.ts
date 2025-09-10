import { examDocuments_MIAGE } from "./MIAGE";
import { examDocuments_ASSRI } from "./ASSRI";
import { examDocuments_SEG } from "./SEG";
import { examDocuments_SEA } from "./SEA";
import { examDocuments_3EA } from "./3EA";
import { examDocuments_SJAP } from "./SJAP";
import { examDocuments_RIT } from "./RIT";

export const allExamDocuments = [
  ...examDocuments_MIAGE,
  ...examDocuments_ASSRI,
  ...examDocuments_SEG,
  ...examDocuments_SEA,
  ...examDocuments_3EA,
  ...examDocuments_SJAP,
  ...examDocuments_RIT,
];
