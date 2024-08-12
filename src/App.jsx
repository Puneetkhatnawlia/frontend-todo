import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Toggle } from "@fluentui/react/lib/Toggle";
import {
  DetailsListLayoutMode,
  PrimaryButton,
  TextField,
  ShimmeredDetailsList as DetailsList,
} from "@fluentui/react";
import { IconButton, Panel } from "@fluentui/react";
import { initializeIcons } from "@fluentui/react";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

import "./App.css";
initializeIcons();

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getMaxDate = () => {
  const today = new Date();
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 30);
  const year = maxDate.getFullYear();
  const month = String(maxDate.getMonth() + 1).padStart(2, "0");
  const day = String(maxDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const App = () => {
  const [data, setData] = useState({
    title: "",
    description: "",
    days: getTodayDate(), // Initialize with today's date
    schedule: "",
  });
  const [render, setRender] = useState([]);
  const [toggleStates, setToggleStates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdated, setIsUpdated] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetch("https://backend-todo-beryl.vercel.app/api/todo")
        .then((response) => response.json())
        .then((data) => {
          const dataWithIndex = data.map((x, index) => ({
            ...x,
            index: index + 1,
          }));
          setRender(dataWithIndex);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          setError(error);
          setLoading(false);
        });
    }, 1000);
    return () => clearTimeout(timer);
  }, [isUpdated]);

  const columns = [
    {
      key: "col0",
      name: "Serial",
      fieldName: "index",
      isMultiline: true,
    },
    {
      key: "col1",
      name: "Title",
      fieldName: "title",
      isMultiline: true,
    },
    {
      key: "col2",
      name: "Description",
      fieldName: "description",
    },
    {
      key: "col3",
      name: "Date",
      fieldName: "days",
    },
    {
      key: "col4",
      name: "Schedule",
      fieldName: "schedule",
    },
    {
      key: "col5",
      name: "Completed",
      fieldName: "completed",
      onRender: (item, index) => (
        <Toggle
          checked={toggleStates[index] || item.completed}
          onChange={(e, val) => handleToggle(index, val)}
        />
      ),
    },
    {
      key: "col6",
      name: "Edit",
      onRender: (item, index) => (
        <IconButton
          iconProps={{ iconName: "Edit" }}
          size={30}
          onClick={() => EditHandler(index)}
        />
      ),
    },
    {
      key: "col7",
      name: "Delete",
      onRender: (item, index) => (
        <IconButton
          iconProps={{ iconName: "Delete" }}
          size={30}
          onClick={() => DeleteHandler(index)}
        />
      ),
    },
  ];

  const handleToggle = (index, checked) => {
    setToggleStates((prev) => ({ ...prev, [index]: checked }));
    const todoId = render[index]._id;

    fetch(`https://backend-todo-beryl.vercel.app/api/todo/${todoId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ completed: checked }),
    })
      .then((response) => response.json())
      .then(() => {
        Swal.fire({
          icon: "success",
          title: checked ? "Marked as Completed" : "Marked as Incompleted",
          showConfirmButton: false,
          timer: 1200,
        });
      })
      .catch((error) => {
        console.error("Error updating data:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to update todo",
        });
      });
  };

  const validateDate = (date) => {
    const today = new Date(getTodayDate());
    const selectedDate = new Date(date);
    const maxDate = new Date(getMaxDate());
    return selectedDate >= today && selectedDate <= maxDate;
  };

  const SubmitHandler = (e) => {
    e.preventDefault();
    if (data.title && data.description && data.days && data.schedule) {
      if (validateDate(data.days)) {
        fetch("https://backend-todo-beryl.vercel.app/api/todo/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })
          .then((response) => response.json())
          .then((newTodo) => {
            setRender([...render, newTodo]);
            setData({
              title: "",
              description: "",
              days: getTodayDate(),
              schedule: "",
            });
          })
          .then(() => {
            Swal.fire({
              icon: "success",
              title: "Todo Added",
              showConfirmButton: false,
              timer: 1200,
            });
            setIsUpdated(isUpdated + 1);
          })
          .catch((error) => {
            console.error("Error posting data:", error);
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "Failed to add todo",
            });
          });
      } else {
        Swal.fire({
          icon: "error",
          title: "Invalid Date",
          text: "Date must be between today and 30 days from today.",
        });
      }
    } else {
      Swal.fire({
        icon: "error",
        title: "Please fill the form",
        showConfirmButton: false,
        timer: 1200,
      });
    }
  };

  const DeleteHandler = (index) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(
          `https://backend-todo-beryl.vercel.app/api/todo/${render[index]._id}`,
          {
            method: "DELETE",
          }
        )
          .then(() => {
            Swal.fire({
              icon: "success",
              title: "Todo Deleted",
              showConfirmButton: false,
              timer: 1200,
            });
            setIsUpdated(isUpdated + 1);
            setRender(render.filter((_, i) => i !== index));
          })
          .catch((error) => {
            console.error("Error deleting data:", error);
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "Failed to delete todo",
            });
          });
      }
    });
  };

  const [openEditPanel, setOpenEditPanel] = useState(false);
  const [editTask, setEditTask] = useState({
    title: "",
    description: "",
    days: getTodayDate(), // Initialize with today's date
    schedule: "",
  });

  const EditHandler = (index) => {
    setOpenEditPanel(true);
    const editTask1 = render[index];
    setEditTask(editTask1);
  };

  const SubmitEditHandler = (e) => {
    e.preventDefault();
    if (
      editTask.title &&
      editTask.description &&
      editTask.days &&
      editTask.schedule
    ) {
      if (validateDate(editTask.days)) {
        fetch(
          `https://backend-todo-beryl.vercel.app/api/todo/${editTask._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(editTask),
          }
        )
          .then(() => {
            Swal.fire({
              icon: "success",
              title: "Todo Edited",
              showConfirmButton: false,
              timer: 1200,
            });
          })
          .then(() => {
            setIsUpdated(isUpdated + 1);
            setOpenEditPanel(false);
          });
      } else {
        Swal.fire({
          icon: "error",
          title: "Invalid Date",
          text: "Date must be between today and 30 days from today.",
        });
      }
    }
  };

  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "#454545 ",
        display: "flex",
        flexDirection: "column",
        gap: "20px 0px",
      }}
      className="main"
    >
      <h1 style={{ color: "#fff", textAlign: "center" }}>Todo List</h1>
      <form
        onSubmit={SubmitHandler}
        style={{ display: "flex", gap: "10px", justifyContent: "center" }}
        className="Input-form"
      >
        <TextField
          type="text"
          placeholder="Title"
          value={data.title}
          onChange={(e) => setData({ ...data, title: e.target.value })}
        />
        <TextField
          type="text"
          placeholder="Description"
          value={data.description}
          onChange={(e) => setData({ ...data, description: e.target.value })}
        />
        <TextField
          type="date"
          placeholder="Days"
          value={data.days}
          onChange={(e) => setData({ ...data, days: e.target.value })}
          min={getTodayDate()} // Set minimum date to today
          max={getMaxDate()} // Set maximum date to 30 days from today
        />
        <TextField
          type="text"
          placeholder="Schedule"
          value={data.schedule}
          onChange={(e) => setData({ ...data, schedule: e.target.value })}
        />
        <PrimaryButton type="submit">Submit</PrimaryButton>
      </form>

      <div style={{ display: "grid", placeContent: "center" }}>
        {render.length === 0 ? (
          <div>
            <h1>No task available</h1>
          </div>
        ) : (
          <DetailsList
            items={render}
            columns={columns}
            setKey="set"
            layoutMode={DetailsListLayoutMode.fixedColumns}
            isMultiline={true}
            selectionMode={0}
            enableShimmer={loading}
          />
        )}
      </div>

      <div>
        <Panel
          isOpen={openEditPanel}
          headerText="Edit Task"
          onDismiss={() => setOpenEditPanel(false)}
        >
          <form
            onSubmit={SubmitEditHandler}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px 0",
            }}
            className="Input-form"
          >
            <TextField
              type="text"
              placeholder="Title"
              value={editTask.title}
              onChange={(e) =>
                setEditTask({ ...editTask, title: e.target.value })
              }
            />
            <TextField
              type="text"
              placeholder="Description"
              value={editTask.description}
              onChange={(e) =>
                setEditTask({ ...editTask, description: e.target.value })
              }
            />
            <TextField
              type="date"
              placeholder="Days"
              value={editTask.days}
              onChange={(e) =>
                setEditTask({ ...editTask, days: e.target.value })
              }
              min={getTodayDate()} // Set minimum date to today
              max={getMaxDate()} // Set maximum date to 30 days from today
            />
            <TextField
              type="text"
              placeholder="Schedule"
              value={editTask.schedule}
              onChange={(e) =>
                setEditTask({ ...editTask, schedule: e.target.value })
              }
            />
            <PrimaryButton type="submit">Update</PrimaryButton>
          </form>
        </Panel>
      </div>
    </div>
  );
};

export default App;
