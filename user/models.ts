import mongoose from "mongoose"
import bcrypt from "bcrypt";


const {Schema} = mongoose;








const SALT_ROUNDS = process.env.SALT_ROUNDS;

 const UserSchema  = new Schema(
  {
    username: { type: String, required: true },
    isLoggedIn: { type: Boolean, default: false },
    roles: { type: String, default: "user" },
    email: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

UserSchema.pre('save', (next) => {
  const user: any = this;
  // only hash the password if it has been modified (or is new)
  if (!user.isModified("password")) return next();

  bcrypt.genSalt(SALT_ROUNDS, (err: Error, salt: String) => {
    if (err) return next(err);
    bcrypt.hash(user.password, Number(salt), (err: Error, hash: String) => {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

UserSchema.methods.comparePassword = (candidatePassword: String, cb: Function ) => {
    const user: any = this
  bcrypt.compare(candidatePassword, user.password, (err: Error, isMatch: Boolean) => {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

export const UserModel = mongoose.model("User", UserSchema);

// class Rank(models.Model):
// @strawberry.enum
// class Modes(models.IntegerChoices):
// Solo_Duo = 0
// FLEX = 1
// TFT = 2
//
// @strawberry.enum
// class Level(models.TextChoices):
// UNRANKED = "UNRANKED"
// IRON = "IRON"
// BRONZE = "BRONZE"
// SILVER = "SILVER"
// GOLD = "GOLD"
// PLAT = "PLAT"
// DIAMOND = "DIAMOND"
// MASTER = "MASTER"
// GRANDMASTER = "GRANDMASTER"
// CHALLENGER = "CHALLENGER"
//
// mode = models.IntegerField(
//     choices=Modes.choices,
// default=Modes.Solo_Duo,
// )
// rank = models.CharField(
//     max_length=11,
//     choices=Level.choices,
// default=Level.UNRANKED,
// )
//
// def __str__(self) -> str:
//     return f"{self.rank}"
//
//
// def validate_less_than_5(value):
// if value > 5:
// raise ValidationError(
//     ("%(value)s is more than 5"),
//     params={"value": value},
// )
//
//
// class RankImage(models.Model):
// rank = models.ForeignKey(
//     Rank, related_name="images", on_delete=models.CASCADE, null=True
// )
// icon = models.ImageField(default="image 2.jpg")
// border = models.ImageField(default="image 2.jpg")
//
//
// class Profile(models.Model):
// rank = models.ForeignKey(Rank, on_delete=models.CASCADE)
// honor_level = models.IntegerField(default=2, validators=[validate_less_than_5])
//
// def __str__(self) -> str:
//     return f"{self.rank}"
//
//
// class ProfileImage(models.Model):
// profile = models.ForeignKey(
//     Profile, related_name="images", on_delete=models.CASCADE, null=True
// )
// background_picture = models.ImageField(default="image 2.jpg")
// trophy = models.ImageField(default="image 2.jpg")
// banner = models.ImageField(default="image 2.jpg")
//
//
// class Player(AbstractUser):
// @strawberry.enum
// class Server(models.IntegerChoices):
// EUW = 0
// NA = 1
// CHINA = 2
// KOREA = 3
// RUSSIA = 4
//
// @strawberry.enum
// class PaymentCurrency(models.IntegerChoices):
// RP = 0
// BE = 1
//
// is_online = models.BooleanField(default=False)
// level = models.IntegerField(default=1)
// server = models.IntegerField(choices=Server.choices, default=Server.EUW)
// profile = models.OneToOneField(
//     Profile, on_delete=models.CASCADE, related_name="player", null=True
// )
// friends = models.ManyToManyField("Player", related_name="+")
// email = models.EmailField(
//     verbose_name="email address",
//     max_length=255,
//     unique=True,
// )
// objects = UserManager()
//
// def __str__(self) -> str:
//     return f"{self.username}"
//
// class Meta:
// verbose_name = "Player"
//
//
// class PlayerImage(models.Model):
// player = models.ForeignKey(
//     Player, related_name="images", on_delete=models.CASCADE, null=True
// )
// icon = models.ImageField(default="image 2.jpg")
//
//
// class PlayerSeasonGrade(models.Model):
// @strawberry.enum
// class SeasonGrade(models.IntegerChoices):
// C_PLUS = 0
//
// B_MINUS = 1
// B = 2
// B_PLUS = 3
//
// A_MINUS = 4
// A = 5
// A_PLUS = 6
//
// S_MINUS = 7
// S = 8
// S_PLUS = 9
//
// player = models.ForeignKey(
//     settings.AUTH_USER_MODEL,
//     on_delete=models.CASCADE,
//     related_name="season_grades",
//     null=True,
// )
// champion = models.ForeignKey(
//     "champions.Champion",
//     on_delete=models.CASCADE,
//     related_name="season_grades",
//     null=True,
// )
// grade = models.IntegerField(choices=SeasonGrade.choices)
// obtained_at = models.DateTimeField(auto_now_add=True)
//
// def __str__(self) -> str:
//     return f"{self.player} got {self.grade} by playing {self.champion}"
//
//
// class Message(models.Model):
// sender = models.ForeignKey(Player, on_delete=models.CASCADE, related_name="+")
// receiver = models.ForeignKey(
//     Player, on_delete=models.CASCADE, related_name="+"
// )
// message = models.TextField()
// timestamp = models.DateTimeField(auto_now_add=True)
// is_read = models.BooleanField(default=False)
//
//
// def __str__(self):
// return self.message
//
// class Meta:
// ordering = ("-timestamp",)