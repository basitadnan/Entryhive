const str = "Order NP-1234 - Daily Plan - 1 days @ Rs.50/day = Rs.50";
console.log(str.match(/-\s*([^-]+?)\s*-\s*(\d+)\s*days/i));
