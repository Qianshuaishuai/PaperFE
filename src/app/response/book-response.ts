import { Book } from '../bean/book';

export interface BookResponse {
    F_list: Book [];
    F_responseMsg: string;
    F_responseNo: number;
}
