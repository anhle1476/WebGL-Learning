class Utils {
  
  static printMatrix(matrix, size = 4) {
    let result = '';
    for (let i = 0; i < matrix.length; i++) {
        let rowIndex = i % size;
        if (rowIndex === 0) {
            result += '\n ' + matrix[i];
        } else {
            result += ', ' + matrix[i];
        }
    }
    console.log(result)
  }
}