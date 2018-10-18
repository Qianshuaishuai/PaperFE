import { PaperDetailsComponent } from './component/details/paper-details/paper-details.component';
import { NgModule } from '@angular/core';
import { Router, RouterModule, Routes } from '@angular/router';
import { PaperListComponent } from './component/paper/paper-list/paper-list.component';
import { PaperLibraryComponent } from './component/paper/paper-library/paper-library.component';
import { SearchListComponent } from './component/paper/search-list/search-list.component';
import { SearchComponent } from './component/paper/search/search.component';
import { PreviewPaperComponent } from './component/preview/preview-paper/preview-paper.component';
import { MinePaperComponent } from './component/paper/mine-paper/mine-paper.component';
import { AnswerSheetEditorComponent } from './component/answer-sheet/answer-sheet-editor/answer-sheet-editor.component';

const routes: Routes = [
   // mark 作为标记，主要是为了区分是否可以加入试题篮 1 表示从备课本进入试卷详情 2 表示从试卷库进入试卷详情
   // type 区分是真题试卷还是组卷 1 表示真题试卷 2 表示组卷
   // paperType 区分试卷的类型 1 表示真题试卷 2 表示我的试卷 3 表示同步试卷
  {
    path: 'detail/:paperId/:mark/:type/:paperType',
    component: PaperDetailsComponent
  },

  {
    path: '',
    redirectTo: 'library',
    pathMatch: 'full'
  },

  {
    path: 'library',
    component: PaperLibraryComponent,
    children: [
      {
        path: ':courseId/:gradeId/:provinceId/:paperTypeId/:mark',
        component: PaperListComponent
        // outlet: 'list'
      },

      {
        path: ':keyword/:courseId/:gradeId/:provinceId/:paperTypeId/:mark',
        component: SearchListComponent
        // outlet: 'list'
      },

      {
        path: ':courseId/:gradeId/:paperTypeId/:mark',
        component: MinePaperComponent
      }
    ]
  },

  // {
  //   path: 'search',
  //   component: SearchComponent,
  //   children: [
  //     {
  //       path: ':keyword',
  //       component: SearchListComponent,
  //       outlet: 'list'
  //     }
  //   ]
  // }
  {
    path: 'preview',
    component: PreviewPaperComponent
  },

  // mode
  // 为 0 表示答题卡制作模式
  // 为 1 表示答题卡下载模式
  // 为 2 表示从组卷进入
  {
    path: 'answer-sheet/:paperId/:mode',
    component: AnswerSheetEditorComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [ RouterModule ]
})

export class AppRoutingModule {

}
