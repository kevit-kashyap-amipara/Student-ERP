require("dotenv").config();
const express = require("express");

const Attendance = require("./models/attendance");
const Batches = require("./models/batches");
const Info = require("./models/info");
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
  res.send(batches);
});
app.post("/addAttendance", async (req, res) => {
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
app.get("/getData", async (req, res) => {
  try {
    const data = await Attendance.find(req.body);
    const studentList = data.map((student) => {
      return {
        name: student.name,
        rollno: student.rollno,
      };
    });
    res.send(studentList);
  } catch (error) {
    res.status(404).send("No data found");
  }
});

app.get("/checkAttendanceStatus", async (req, res) => {
  // (in find method)in req.body if key name is same as our model's key name then it will find the same object which has this key else just ignores the key
  const maxDay = await Attendance.find(req.body).sort({ totalDays: -1 });

  if (maxDay.length === 0) {
    return res.status(400).send("No data found");
  }

  const totaldays = maxDay[0].totalDays;

  const Data = maxDay
    .filter((student) => {
      return (
        student.totalDays === totaldays &&
        student.attendance > req.body.attendancePR
      );
    })
    .map((student) => {
      return {
        name: student.name,
        rollno: student.rollno,
        attendance: student.attendance,
      };
    });
  res.send(Data);
});

app.get("/getInfo", async (req, res) => {
  let data = await Info.find({});
  let totalStudents = 0;
  let totalStudentsIntake = 0;
  let availableIntake = 0;
  let batch = req.body.batch;

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

app.post("/addInfo", async (req, res) => {
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
    console.log("there is some error!!");
    res.send();
  }
});
app.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});
