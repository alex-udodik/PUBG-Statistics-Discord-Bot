module.exports = {

    get: async function (rp) {
        var uri;

        if (rp > 0 && rp < 1500) {
            uri = "assets/insignias/Bronze_1.png"
        } else if (rp >= 1500 && rp < 1600) {
            uri = "assets/insignias/Silver_5.png";
        } else if (rp >= 1600 && rp < 1700) {
            uri = "assets/insignias/Silver_4.png";
        } else if (rp >= 1700 && rp < 1800) {
            uri = "assets/insignias/Silver_3.png";
        } else if (rp >= 1800 && rp < 1900) {
            uri = "assets/insignias/Silver_2.png";
        } else if (rp >= 1900 && rp < 2000) {
            uri = "assets/insignias/Silver_1.png";
        } else if (rp >= 2000 && rp < 2100) {
            uri = "assets/insignias/Gold_5.png";
        } else if (rp >= 2100 && rp < 2200) {
            uri = "assets/insignias/Gold_4.png";
        } else if (rp >= 2200 && rp < 2300) {
            uri = "assets/insignias/Gold_3.png";
        } else if (rp >= 2300 && rp < 2400) {
            uri = "assets/insignias/Gold_2.png";
        } else if (rp >= 2400 && rp < 2500) {
            uri = "assets/insignias/Gold_1.png";
        } else if (rp >= 2500 && rp < 2600) {
            uri = "assets/insignias/Platinum_5.png";
        } else if (rp >= 2600 && rp < 2700) {
            uri = "assets/insignias/Platinum_4.png";
        } else if (rp >= 2700 && rp < 2800) {
            uri = "assets/insignias/Platinum_3.png";
        } else if (rp >= 2800 && rp < 2900) {
            uri = "assets/insignias/Platinum_2.png";
        } else if (rp >= 2900 && rp < 3000) {
            uri = "assets/insignias/Platinum_1.png";
        } else if (rp >= 3000 && rp < 3100) {
            uri = "assets/insignias/Diamond_5.png";
        } else if (rp >= 3100 && rp < 3200) {
            uri = "assets/insignias/Diamond_4.png";
        } else if (rp >= 3200 && rp < 3300) {
            uri = "assets/insignias/Diamond_3.png";
        } else if (rp >= 3300 && rp < 3400) {
            uri = "assets/insignias/Diamond_2.png";
        } else if (rp >= 3400 && rp < 3500) {
            uri = "assets/insignias/Diamond_1.png";
        } else if (rp >= 3500) {
            uri = "assets/insignias/Master.png";
        } else {
            uri = "assets/insignias/Unranked.png";
        }

        return uri;
    }
}