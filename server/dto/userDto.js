module.exports = class UserDto {
    email;
    id;
    isActivated;

    constructor(model) {
        this.email = model.email;
        this.id = model._id;
        this.isActivated = model.isActive;
    }
}

// export class UserDto{
//     constructor(readonly email, readonly id, readonly isActivated){}
// }