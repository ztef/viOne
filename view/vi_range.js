export class vi_range{

    constructor(min, max){
        
        this.min = min;
        this.max = max;
    
    }

    in(n){
        if(n >= this.min && n <= this.max){
            return true;
        } else {
            return false;
        }
    }

}