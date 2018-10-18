import { Pipe, PipeTransform } from '@angular/core';
import { CHINESE, JUNIOR_CHINESE, MATH, JUNIOR_MATH, ENGLISTH, JUNIOR_ENGLISTH, PHYSICY, JUNIOR_PHYSICY,
  CHEMISTRY, JUNIOR_CHEMISTRY, BIOLOGY, JUNIOR_BIOLOGY, HISTORY, JUNIOR_HISTORY, GEOGRAPHY, JUNIOR_GEOGRAPHY,
  POLITICS, JUNIOR_POLITICS, SENIOR_CHINESE, SENIOR_MATH, SENIOR_ENGLISTH, SENIOR_PHYSICY, SENIOR_CHEMISTRY,
  SENIOR_BIOLOGY, SENIOR_HISTORY, SENIOR_GEOGRAPHY, SENIOR_POLITICS, JUNIOR_SCHOOL, SENIOR_SCHOOL, PRIMARY_SCHOOL, 
  PRIMARY_CHINESE, PRIMARY_MATH, PRIMARY_ENGLISH } from '../constants';

@Pipe({
  name: 'mapSubject'
})
export class MapSubjectPipe implements PipeTransform {

  transform(subjectId: number, stageId: number): any {
    if (stageId === JUNIOR_SCHOOL) {
      if (subjectId === CHINESE) {
        return JUNIOR_CHINESE;
      } else if (subjectId === MATH) {
        return JUNIOR_MATH;
      } else if (subjectId === ENGLISTH) {
        return JUNIOR_ENGLISTH;
      } else if (subjectId === PHYSICY) {
        return JUNIOR_PHYSICY;
      } else if (subjectId === CHEMISTRY) {
        return JUNIOR_CHEMISTRY;
      } else if (subjectId === BIOLOGY) {
        return JUNIOR_BIOLOGY;
      } else if (subjectId === HISTORY) {
        return JUNIOR_HISTORY;
      } else if (subjectId === GEOGRAPHY) {
        return JUNIOR_GEOGRAPHY;
      } else if (subjectId === POLITICS) {
        return JUNIOR_POLITICS;
      }
    } else if (stageId === SENIOR_SCHOOL) {
      if (subjectId === CHINESE) {
        return SENIOR_CHINESE;
      } else if (subjectId === MATH) {
        return SENIOR_MATH;
      } else if (subjectId === ENGLISTH) {
        return SENIOR_ENGLISTH;
      } else if (subjectId === PHYSICY) {
        return SENIOR_PHYSICY;
      } else if (subjectId === CHEMISTRY) {
        return SENIOR_CHEMISTRY;
      } else if (subjectId === BIOLOGY) {
        return SENIOR_BIOLOGY;
      } else if (subjectId === HISTORY) {
        return SENIOR_HISTORY;
      } else if (subjectId === GEOGRAPHY) {
        return SENIOR_GEOGRAPHY;
      } else if (subjectId === POLITICS) {
        return SENIOR_POLITICS;
      }
    } else if (stageId === PRIMARY_SCHOOL) {
      if (subjectId === CHINESE) {
        return PRIMARY_CHINESE;
      } else if (subjectId === MATH) {
        return PRIMARY_MATH;
      } else if (subjectId === ENGLISTH) {
        return PRIMARY_ENGLISH;
      }
    }
  }
}
