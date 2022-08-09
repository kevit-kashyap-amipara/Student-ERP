require("dotenv").config();
const express = require("express");
const Student = require("./models/student");
const Attendance = require("./models/attendance");
const Batches = require("./models/batches");
const Superuser = require("./models/superuser.js");
const bcrypt = require("bcryptjs");

const Info = require("./models/info");

const auth = require("./middleware/auth");
const SuperUser = require("./models/superuser");
require("./db/mongoose");

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;

app.get("/", async (req, res) => {
  const batches = await Batches.aggregate([
    {
      $unwind: "$branches",
    },

    {
      $group: {
        _id: { year: "$year" },

        totalStudents: { $sum: "$branches.totalStudentsIntake" },

        branches: {
          $push: { k: "$branches.name", v: "$branches.totalStudentsIntake" },
        },
      },
    },

    {
      $project: {
        totalStudents: 1,

        branches: { $arrayToObject: "$branches" },
      },
    },

    {
      $sort: { _id: 1 },
    },
  ]);

  res.send(batches);
});

app.post("/student/addStudent", auth, async (req, res) => {
  const student = new Student(req.body);
  try {
    await student.save();
    res.send(student);
  } catch (e) {
    res.send("there is some error!");
  }
});

app.post("/attendance/addAttendance", auth, async (req, res) => {
  try {
 
    const total = await Attendance.find({ rollno: req.body.rollno }).sort({
      totalDays: -1,
    });

    req.body.totalDays = total.length === 0 ? 1 : total[0].totalDays + 1;

    const present = req.body.present === true ? 1 : 0;

    req.body.presentCount =
      total.length === 0 ? present : total[0].presentCount + present;
    req.body.attendance =
      total.length === 0
        ? present * 100
        : (req.body.presentCount / req.body.totalDays) * 100;

    console.log(
      total.length,
      req.body.totalDays,
      req.body.presentCount,
      req.body.attendance
    );

    const attendance = new Attendance(req.body);
    await attendance.save();
    res.send(attendance);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/attendance/getAbsent", auth, async (req, res) => {
  const { date, present, batch, branch, sem } = req.body;
  try {
    const data = await Attendance.find({ date, present });

    const rollNums = data.map((student) => student.rollno);
    console.log(rollNums);

    const studentsList = await Student.find({
      rollno: { $in: rollNums },
      batch,
      branch,
      sem,
    });
    if (studentsList.length === 0)
      return res.status(404).send("Data Not Found");

    res.send(studentsList);
  } catch (error) {
    res.status(404).send("No data found");
  }
});

app.get("/attendance/checkAttendanceStatus", auth, async (req, res) => {
  const { batch, branch, sem } = req.body;
  // (in find method)in req.body if key name is same as our model's key name then it will find the same object which has this key else just ignores the key
  const students = await Student.find({ batch, branch, sem });

  const rollNums = students.map((student) => student.rollno);

  const maxDay = await Attendance.find({ rollno: { $in: rollNums } }).sort({
    totalDays: -1,
  });

  if (maxDay.length === 0) {
    return res.status(400).send("No data found");
  }

  const totaldays = maxDay[0].totalDays;

  const Data = maxDay
    .filter((student) => {
      return student.totalDays === totaldays && student.attendance < req.body.attendance;
    })
    .map((student) => student.rollno);
 

  if (Data.length === 0) return res.send("No data found!");
  res.send(Data);
});

app.get("/seatInfo/getInfo", auth, async (req, res) => {
  let data = await Info.find({});
  let totalStudents = 0;
  let totalStudentsIntake = 0;
  let availableIntake = 0;
  let batch = req.body.batch;
  if (data.length === 0) {
    return res.send("there is No data available!!");
  }
  data.forEach((obj) => {
    obj.branches.forEach((ele) => {
      totalStudents += ele.totalStudents;
      totalStudentsIntake += ele.totalStudentsIntake;
    });

    availableIntake = totalStudentsIntake - totalStudents;
  });
  const ans = data[0].branches.map((obj) => {
    const tp = {};

    tp[obj.branchName] = {
      totalStudents: obj.totalStudents,
      totalStudentsIntake: obj.totalStudentsIntake,
      availableIntake: obj.totalStudentsIntake - obj.totalStudents,
    };
    return tp;
  });

  res.send({
    batch: batch,
    totalStudents: totalStudents,
    totalStudentsIntake: totalStudentsIntake,
    availableIntake: availableIntake,
    branches: ans,
  });
});

app.post("/seatInfo/addInfo", auth, async (req, res) => {
  let branchesForBatch = await Info.find({ batch: req.body.batch });

  console.log(branchesForBatch.length);

  try {
    if (branchesForBatch.length === 0) {
      const info = new Info({
        batch: req.body.batch,
        branches: [req.body.branch],
      });
      await info.save();
      res.send(info);
    } else {
      branchesForBatch = branchesForBatch[0];
      console.log(branchesForBatch.branches);
      branchesForBatch.branches = branchesForBatch.branches.concat(
        req.body.branch
      );

      await branchesForBatch.save();
      res.send(branchesForBatch);
    }
  } catch (e) {
    res.send("there is some error!!");
  }
});

app.post("/admin/addAdmin", async (req, res) => {
  try {
    const admin = new Superuser(req.body);
    admin.password = await bcrypt.hash(admin.password, 8);
    await admin.save();
    await admin.generateAuthToken();
    res.send({ admin });
  } catch (error) {
    res.status(400).send();
  }
});

app.post("/staff/addSuperUser", auth, async (req, res) => {
  try {
    console.log(req.user);
    if (req.user.email === "admin@admin.com") {
      const staffMember = new Superuser(req.body);
      staffMember.password = await bcrypt.hash(staffMember.password, 8);
      await staffMember.save();
      await staffMember.generateAuthToken();
      return res.send({ succes: true, staffMember });
    }
    res.status(401).send("Your are not authorized to add staff member!!");
  } catch (error) {
    res.status(400).send();
  }
});

app.post("/staff/login", async (req, res) => {
  try {
    const user = await Superuser.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ login: "success", user, token });
  } catch (error) {
    res.status(400).send("Invalid credentials");
  }
});
app.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});
