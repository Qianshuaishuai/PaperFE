import { Course } from '../bean/course';

export interface CourseResponse {
    F_courses: Course[];
    F_responseMsg: string;
    F_responseNo: number;
}
