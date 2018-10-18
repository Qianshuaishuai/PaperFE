import { Injectable } from '@angular/core';
import { Subject, Observable, SubscriptionLike } from 'rxjs';
import { Course } from '../bean/course';
import { Courseware } from '../bean/courseware';
import { SearchModel } from '../bean/search-model';
import { QuestionBasket } from '../bean/question-basket';
import { Question, PaperQuestionSetChapter } from '../component/details/paper-details/data/paperDetailsResponse';
import { QuestionType } from '../bean/question-type';
import { QuestionsBasket } from '../response/question-basket-response';
import { SolveDialog } from '../bean/solve-dialog';
import { CorrectionDialog } from '../bean/correction-dialog';
import { ChangeScore } from '../bean/change-score';
import { Bookname } from '../bean/bookname';

@Injectable()
export class MessageService {

  constructor() { }

  paramsSubject: Subject<number []> = new Subject();
  coursesSubject: Subject<Course []> = new Subject();
  isClickCourseSubject: Subject<boolean> = new Subject();
  selectedResourceListSubject: Subject<Courseware []> = new Subject();
  searchModelSubject: Subject<SearchModel> = new Subject();
  promptMessageSubject: Subject<string> = new Subject();
  cancelQuoteSubject: Subject<number> = new Subject();
  questionBasketSubject: Subject<QuestionBasket> = new Subject();
  allQuestionsSubject: Subject<PaperQuestionSetChapter[]> = new Subject();

  dialogSubject: Subject<number> = new Subject();
  dialogSureSubject: Subject<number> = new Subject();
  updateStatusSubject: Subject<QuestionsBasket | number> = new Subject();
  solveDialogSubject: Subject<SolveDialog> = new Subject();
  correctionDialogSubject: Subject<CorrectionDialog> = new Subject();
  changeScoreSubject: Subject<ChangeScore> = new Subject();
  changeScoreDialogSubject: Subject<number> = new Subject();

  clickNavigationSubject: Subject<number> = new Subject();

  messageDialogSubject: Subject<string> = new Subject();
  totalPageSubject: Subject<number> = new Subject();
  paperQuestionSetChapterSubject: Subject<PaperQuestionSetChapter[]> = new Subject();
  paperDetailIds: Subject<number[]> = new Subject();
  previewPaperCourseId: Subject<number> = new Subject();
  bookName: Subject<string> = new Subject();
  syncVersion: Subject<Bookname> = new Subject();
  blankQuestion: Subject<Question> = new Subject();

  // 是否从详情页返回
  private isReturnFromDetail = false;
  // 用户选中的页码
  private locatedPage = 1;
  // 用户进入详情页的入口dom节点
  private enterDom: any;
  // 同步试卷的教材
  private syncBook;
  private syncBookName;
  // 是否点击更多教材
  private isBooknameFade;
  private isBookFade;


  sendParams(params: number []) {
    this.paramsSubject.next(params);
  }

  getParams(): Observable<number []> {
    return this.paramsSubject.asObservable();
  }

  sendCourses(courses: Course []) {
    this.coursesSubject.next(courses);
  }

  getCourses(): Observable<Course []> {
    return this.coursesSubject.asObservable();
  }

  sendClickCourse() {
    this.isClickCourseSubject.next(true);
  }

  getClickCourse(): Observable<boolean> {
    return this.isClickCourseSubject.asObservable();
  }

  sendSelectedResourceList(coursewares: Courseware []) {
    this.selectedResourceListSubject.next(coursewares);
  }

  getSelectedResourceList(): Observable<Courseware []> {
    return this.selectedResourceListSubject.asObservable();
  }

  enterSearchModel(searchModel: SearchModel) {
    this.searchModelSubject.next(searchModel);
  }

  exitSearchModel(searchModel: SearchModel) {
    this.searchModelSubject.next(searchModel);
  }

  getSearchModel(): Observable<SearchModel> {
    return this.searchModelSubject.asObservable();
  }

  sendPromptMessage(message: string) {
    this.promptMessageSubject.next(message);
  }

  getPromptMessage(): Observable<string> {
    return this.promptMessageSubject.asObservable();
  }

  sendCancelQuote(id: number) {
    this.cancelQuoteSubject.next(id);
  }

  getCancelQuote(): Observable<number> {
    return this.cancelQuoteSubject.asObservable();
  }

  joinQuestionBasket(basket: QuestionBasket) {
    this.questionBasketSubject.next(basket);
  }

  removeFromQuestionBasket(basket: QuestionBasket) {
    this.questionBasketSubject.next(basket);
  }

  getQuestionBasket(): Observable<QuestionBasket> {
    return this.questionBasketSubject.asObservable();
  }

  sendDialogMessage(mark: number) {
    this.dialogSubject.next(mark);
  }

  getDialogObservable(): Observable<number> {
    return this.dialogSubject.asObservable();
  }

  sendDialogSureMessage(mark: number) {
    this.dialogSureSubject.next(mark);
  }

  getDialogSureObservable(): Observable<number> {
    return this.dialogSureSubject.asObservable();
  }

  sendUpdateStatusMessage(params: QuestionsBasket | number) {
    this.updateStatusSubject.next(params);
  }

  getUpdateStatusObservable(): Observable<QuestionsBasket | number> {
    return this.updateStatusSubject.asObservable();
  }

  sendAddAllQuestionsMessage(chapters: PaperQuestionSetChapter[]) {
    this.allQuestionsSubject.next(chapters);
  }

  sendRemoveAllQuestionsMessage() {
    this.allQuestionsSubject.next(null);
  }

  getAndAndRemoveAllQuestionsObservable(): Observable<PaperQuestionSetChapter []> {
    return this.allQuestionsSubject.asObservable();
  }

  sendSolveDialogMessage(bean: SolveDialog) {
    this.solveDialogSubject.next(bean);
  }

  getSolveDialogObservable(): Observable<SolveDialog> {
    return this.solveDialogSubject.asObservable();
  }

  sendCorrectionDialogMessage(bean: CorrectionDialog) {
    this.correctionDialogSubject.next(bean);
  }

  getCorrectionDialogObservable(): Observable<CorrectionDialog> {
    return this.correctionDialogSubject.asObservable();
  }

  sendChangeScoreMessage(score: ChangeScore) {
    this.changeScoreSubject.next(score);
  }

  getChangeScoreObservable(): Observable<ChangeScore> {
    return this.changeScoreSubject.asObservable();
  }

  sendChangeScoreSureMessage(mark: number) {
    this.changeScoreDialogSubject.next(mark);
  }

  getChangeScoreDialogObservable(): Observable<number> {
    return this.changeScoreDialogSubject.asObservable();
  }

  sendclickNavigationMessage(isClickPaper: number) {
    this.clickNavigationSubject.next(isClickPaper);
  }

  getclickNavigationObservable(): Observable<number> {
    return this.clickNavigationSubject.asObservable();
  }

  /**
   * 温馨提示 dialog
   */
  getMessageDialog(): Observable<string> {
    return this.messageDialogSubject.asObservable();
  }

  sendMessageDialog(message: string) {
    this.messageDialogSubject.next(message);
  }

  /**
   * 分页数据
   */
  sendTotalPage(totalPage: number) {
    this.totalPageSubject.next(totalPage);
  }

  getTotalPage(): Observable<number> {
    return this.totalPageSubject.asObservable();
  }

  // 试卷加载数据数组
  sendPaperQuestionSetChapters(paperQuestionSetChapters: PaperQuestionSetChapter []) {
    this.paperQuestionSetChapterSubject.next(paperQuestionSetChapters);
  }

  getPaperQuestionSetChapters(): Observable<PaperQuestionSetChapter []> {
    return this.paperQuestionSetChapterSubject.asObservable();
  }

  // 试卷详情移出全部试题传递id数组
  sendPaperDetailIds(detailIds: number[]) {
    this.paperDetailIds.next(detailIds);
  }

  getPaperDetailIds(): Observable<number[]> {
    return this.paperDetailIds.asObservable();
  }

  sendBookName(bookName: string) {
    this.bookName.next(bookName);
  }

  getBookName(): Observable<string> {
    return this.bookName.asObservable();
  }

  sendSyncVersion(version: Bookname) {
    this.syncVersion.next(version);
  }

  getSyncVersion(): Observable<Bookname> {
    return this.syncVersion.asObservable();
  }

  sendBlankQuestion(blankQuestion: Question) {
    this.blankQuestion.next(blankQuestion);
  }

  getBlankQuestion(): Observable<Question> {
    return this.blankQuestion.asObservable();
  }

  // 是否从详情页返回
  setIsReturnFromDetail(flag: boolean): void {
    this.isReturnFromDetail = flag;
  }

  getIsReturnFromDetail(): boolean {
    return this.isReturnFromDetail;
  }

  // 用户从哪进的详情页
  setLocatedPage(page: number): void {
    this.locatedPage = page;
  }

  getLocatedPage(): number {
    return this.locatedPage;
  }

  // 进入详情页之前的dom节点
  setEnterDom(node: any): void {
    this.enterDom = node;
  }

  getEnterDom(): any {
    return this.enterDom;
  }

  // 同步试卷的教材
  setSyncBook(book: any): void {
    this.syncBook = book;
  }

  getSyncBook(): any {
    return this.syncBook;
  }

  // 同步试卷的版本
  setSyncBookName(bookName: string): void {
    this.syncBookName = bookName;
  }

  getSyncBookName(): string {
    return this.syncBookName;
  }

  // 是否点击更多教材
  setIsBooknameFade(flag: boolean): void {
    this.isBooknameFade = flag;
  }

  getIsBooknameFade(): boolean {
    return this.isBooknameFade;
  }

  setIsBookFade(flag: boolean): void {
    this.isBookFade = flag;
  }

  getIsBookFade(): boolean {
    return this.isBookFade;
  }
}
