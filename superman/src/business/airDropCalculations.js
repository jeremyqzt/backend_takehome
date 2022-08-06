export const getTokenPerUser = (users, amount) => {
    return amount / users;
}

const MONTH = ["January","February","March","April","May","June","July","August","September","October","November","December"];
export const getTokenAwardDate =() => {
    const d = new Date();
    let mm = MONTH[d.getMonth()];
    var dd = String(d.getDate()).padStart(2, '0');
    var yyyy = d.getFullYear();

    return `${mm} ${dd} ${yyyy}`;
}