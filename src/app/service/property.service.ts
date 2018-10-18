import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

@Injectable()
export class PropertyService {

  constructor(private storageService: StorageService) { }

  writeTeacherId(teacherId: string) {
    this.storageService.write('teacherId', teacherId);
  }

  readTeacherId(): string {
    return this.storageService.read<string>('teacherId');
  }

  writeAccesstoken(accesstoken: string) {
    this.storageService.write('accesstoken', accesstoken);
  }

  readAccesstoken(): string {
    return this.storageService.read<string>('accesstoken');
  }

  writePeriodId(periodId: string) {
    this.storageService.write('periodId', periodId);
  }

  readPeriodId(): string {
    return this.storageService.read<string>('periodId');
  }

  writeMoment(moment: string) {
    this.storageService.write('moment', moment);
  }

  readMoment(): string {
    return this.storageService.read<string>('moment');
  }

  writeSubjectId(subjectId: number) {
    this.storageService.write('subjectId', subjectId);
  }

  readSubjectId(): number {
    return this.storageService.read<number>('subjectId');
  }

  writeOldSubjectId(oldSubjectId: number) {
    this.storageService.write('oldSubjectId', oldSubjectId);
  }

  readOldSubjectId(): number {
    return this.storageService.read<number>('oldSubjectId');
  }

  writeGradeId(gradeId: number) {
    this.storageService.write('gradeId', gradeId);
  }

  readGradeId(): number {
    return this.storageService.read<number>('gradeId');
  }

  writeOldGradeId(oldGradeId: number) {
    this.storageService.write('oldGradeId', oldGradeId);
  }

  readOldGradeId(): number {
    return this.storageService.read<number>('oldGradeId');
  }

  writeStageId(stageId: number) {
    this.storageService.write('stageId', stageId);
  }

  readStageId(): number {
    return this.storageService.read<number>('stageId');
  }

  writeOldStageId(oldStageId: number) {
    this.storageService.write('oldStageId', oldStageId);
  }

  readOldStageId(): number {
    return this.storageService.read<number>('oldStageId');
  }

  writePaperTypeId(paperTypeId: number) {
    this.storageService.write('paperTypeId', paperTypeId);
  }

  readPaperTypeId(): number {
    return this.storageService.read<number>('paperTypeId');
  }

  writeProvinceId(provinceId: number) {
    this.storageService.write('provinceId', provinceId);
  }

  readProvinceId(): number {
    return this.storageService.read<number>('provinceId');
  }

  writeQuestionTypeList(questionBasket: string) {
    this.storageService.write('questionBasket', questionBasket);
  }

  readQuestionTypeList(): string {
    return this.storageService.read<string>('questionBasket');
  }

  writeChangedScore(changedScore: string) {
    this.storageService.write('changedScore', changedScore);
  }

  readChangedScore(): string {
    return this.storageService.read<string>('changedScore');
  }

  /**
   * @param status 1 表示套卷 2 表示我的试卷 3 表示同步试卷
   */
  writeCurrentNavigationStatus(status: number) {
    this.storageService.write('currentNavigationStatus', status);
  }

  readCurrentNavigationStatus(): number {
    return this.storageService.read<number>('currentNavigationStatus');
  }

  writeCurrentSubject(currentSubject: string) {
    this.storageService.write('currentSubject', currentSubject);
  }

  readCurrentSubject(): string {
    return this.storageService.read<string>('currentSubject');
  }

  writeChapterName(chapterName: string) {
    this.storageService.write('chapterName', chapterName);
  }

  readChapterName(): string {
    return this.storageService.read<string>('chapterName');
  }

  writeBookVersion(bookVersion: string) {
    this.storageService.write('bookVersion', bookVersion);
  }

  readBookVersion(): string {
    return this.storageService.read<string>('bookVersion');
  }

  writeBookId(bookId: number) {
    this.storageService.write('bookId', bookId);
  }

  readBookId(): number {
    return this.storageService.read<number>('bookId');
  }

  writeChapterId(chapterId: number) {
    this.storageService.write('chapterId', chapterId);
  }

  readChapterId(): number {
    return this.storageService.read<number>('chapterId');
  }

  writeTitle(title: string) {
    this.storageService.write('title', title);
  }

  readTitle(): string {
    return this.storageService.read<string>('title');
  }

  clear() {
    this.storageService.clear();
  }
}
