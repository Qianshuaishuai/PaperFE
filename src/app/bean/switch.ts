export class Stage {
  F_stage_id: string;
  F_stage_name: string;
}

export class Book {
  F_book_id: number;
  F_book_name: string;
  F_book_cover: string;
  F_book_subject: number;
  F_book_grade: number;
  F_book_edition_id: number;
  F_book_edition_name: string;
  F_book_pressName: string;
}

export class Chapter {
  F_chapter_id: number;
  F_chapter_name: string;
  F_period_list: PeriodList[];
  F_chapter_children: ChapterChidren[];
}

class ChapterChidren {
  F_chapter_id: number;
  F_chapter_name: string;
  F_period_list: PeriodList[];
}

class PeriodList {
  F_period_id: string;
  F_prefix_num: number;
  F_middle_num: number;
  F_end_num: number;
}
