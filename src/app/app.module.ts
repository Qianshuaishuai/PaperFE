import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Renderer2 } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { PaperLibraryComponent } from './component/paper/paper-library/paper-library.component';
import { SelectorComponent } from './component/paper/selector/selector.component';

import { SelectorService } from './service/selector.service';
import { PaperListComponent } from './component/paper/paper-list/paper-list.component';
import { PaperService } from './service/paper.service';
import { AppRoutingModule } from './app-routing.module';
import { PaperDetailsComponent } from './component/details/paper-details/paper-details.component';
import { PaperDetailsUtils } from './component/details/paper-details/paper-details.utils';
import { Utils } from './utils';
import { StorageService } from './service/storage.service';
import { SearchComponent } from './component/paper/search/search.component';
import { SearchListComponent } from './component/paper/search-list/search-list.component';
import { MessageService } from './service/message.service';
import { PropertyService } from './service/property.service';
import { MenuComponent } from './component/paper/menu/menu.component';
import { SafePipe } from './pipe/safe.pipe';
import { LoadingSpinnerComponent } from './component/common/loading-spinner/loading-spinner.component';
import { HttpClientService } from './service/http-client.service';
import { LoaderService } from './service/loader.service';
import { QuestionBasketComponent } from './component/details/question-basket/question-basket.component';
import { PreviewPaperComponent } from './component/preview/preview-paper/preview-paper.component';
import { EditPaperComponent } from './component/preview/edit-paper/edit-paper.component';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { MatSnackBarModule } from '@angular/material';
import { DirectivesModule } from './directive/directive.module';
import { SwitchBookService } from './service/switch-book.service';
import { SwitchSubjectPipe } from './pipe/switch-subject.pipe';
import { PaperTypePipe } from './pipe/paper-type.pipe';
import { DialogComponent } from './component/common/dialog/dialog.component';
import { PromptMessageComponent } from './component/common/prompt-message/prompt-message.component';
import { CommonService } from './service/common.service';
import { GradePipe } from './pipe/grade.pipe';
import { ChangeScoreComponent } from './component/preview/change-score/change-score.component';
import { QuestionTypePipe } from './pipe/question-type.pipe';
import { MapSubjectPipe } from './pipe/map-subject.pipe';
import { MinePaperComponent } from './component/paper/mine-paper/mine-paper.component';
import { PaperAnalysisComponent } from './component/preview/paper-analysis/paper-analysis.component';
import { PaperDownloadComponent } from './component/preview/paper-download/paper-download.component';

import { DragulaModule } from 'ng2-dragula';
import { FormatAnswerPipe } from './pipe/format-answer.pipe';
import { CorrectComponent } from './component/common/correct/correct.component';
import { SolutionComponent } from './component/common/solution/solution.component';
import { NgxEchartsModule } from 'ngx-echarts';

// 答题卡相关组件
import { AnswerSheetEditorComponent } from './component/answer-sheet/answer-sheet-editor/answer-sheet-editor.component';
import { AnswerSheetComponent } from './component/answer-sheet/answer-sheet/answer-sheet.component';
import { AsHeaderFrontComponent } from './component/answer-sheet/as-header-front/as-header-front.component';
import { AsInfoNumberComponent } from './component/answer-sheet/as-info-number/as-info-number.component';
import { AsInfoBarcodeComponent } from './component/answer-sheet/as-info-barcode/as-info-barcode.component';
import { AsLocatePointsComponent } from './component/answer-sheet/as-locate-points/as-locate-points.component';
import { AsQuestionComponent } from './component/answer-sheet/as-question/as-question.component';
import { AsDangerZoneComponent } from './component/answer-sheet/as-danger-zone/as-danger-zone.component';
import { AsPageIndexComponent } from './component/answer-sheet/as-page-index/as-page-index.component';
import { ResizeEvent, ResizableModule } from 'angular-resizable-element';

import { TreeModule } from 'ng2-tree';
import { FormatHTMLPipe } from './pipe/format-html.pipe';
import { DownloadDialogComponent } from './component/preview/download-dialog/download-dialog.component';
import { GenerateOptionsPipe } from './component/answer-sheet/pipe/generate-options.pipe';
import { MessageDialogComponent } from './component/common/message-dialog/message-dialog.component';
import { PaginationComponent } from './component/common/pagination/pagination.component';
import { CountToArrayPipe } from './component/answer-sheet/pipe/count-to-array.pipe';
import { DifficultyPipe } from './pipe/difficulty.pipe';
import { BlankQuestionComponent } from './component/preview/blank-question/blank-question.component';
import { TypeToTypePipe } from './component/answer-sheet/pipe/type-to-type.pipe';

@NgModule({
  declarations: [
    AppComponent,
    PaperLibraryComponent,
    SelectorComponent,
    PaperListComponent,
    PaperDetailsComponent,
    SearchComponent,
    SearchListComponent,
    MenuComponent,
    SafePipe,
    LoadingSpinnerComponent,
    QuestionBasketComponent,
    PreviewPaperComponent,
    SwitchSubjectPipe,
    PaperTypePipe,
    DialogComponent,
    PromptMessageComponent,
    GradePipe,
    ChangeScoreComponent,
    QuestionTypePipe,
    MapSubjectPipe,
    MinePaperComponent,
    FormatAnswerPipe,
    CorrectComponent,
    SolutionComponent,
    PaperAnalysisComponent,
    AnswerSheetEditorComponent,
    AnswerSheetComponent,
    AsHeaderFrontComponent,
    AsInfoNumberComponent,
    AsInfoBarcodeComponent,
    AsLocatePointsComponent,
    AsQuestionComponent,
    AsDangerZoneComponent,
    AsPageIndexComponent,
    FormatHTMLPipe,
    PaperDownloadComponent,
    DownloadDialogComponent,
    EditPaperComponent,
    GenerateOptionsPipe,
    MessageDialogComponent,
    PaginationComponent,
    CountToArrayPipe,
    DifficultyPipe,
    BlankQuestionComponent,
    TypeToTypePipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    DirectivesModule,
    DragulaModule,
    NgxEchartsModule,
    TreeModule,
    ResizableModule,
  ],

  providers: [
    PaperDetailsUtils,
    SelectorService,
    PaperService,
    StorageService,
    Utils,
    MessageService,
    PropertyService,
    HttpClientService,
    LoaderService,
    SwitchBookService,
    CommonService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {

}
