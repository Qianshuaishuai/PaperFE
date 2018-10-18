export class PaperQuestionResponse {
    F_responseNo: number;
    F_responseMsg: string;
    F_info= new F_info;
}

export class F_info {
    F_resource_id: number;
    F_title: string;
    F_type_detail: number;
    F_courseware_uri: string;
    F_data = new F_data;
}

export class F_data {
    id: number;
    courseId: number;
    content: string;
    accessories = new Accessories;
    solution: string;
    solutionAccessories: string;
    source: string;
    shortSource: string;
    type: number;
    typeName: string;
    tags: string;
    materialId: number;
    setId: number;
    correctAnswer: string;
    isMaterial = false; // 添加标示，判断是否在同一份材料下的小题,默认false
    keypoints = new KeyPoints;
}

export class KeyPoints {
    id: number;
    name: string;
    type: number;
}

export class Accessories {
    options: {};
    type: number;
}
