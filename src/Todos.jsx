import { useState, useEffect } from "react";
import {
  PrimaryButton,
  TextField,
  DetailsList,
  DetailsListLayoutMode,
  IconButton,
  Panel,
  Label,
  Toggle,
  Pivot,
  PivotItem,
} from "@fluentui/react";
import Swal from "sweetalert2";
import "./App.css";
import "./Fluent.css";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

import { mergeStyles } from "@fluentui/react/lib/Styling";

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
    days: getTodayDate(),
    schedule: "",
  });

  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [toggleStates, setToggleStates] = useState({});
  const [isUpdated, setIsUpdated] = useState(0);
  const [openEditPanel, setOpenEditPanel] = useState(false);
  const [editTask, setEditTask] = useState({
    title: "",
    description: "",
    days: getTodayDate(),
    schedule: "",
  });
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "https://backend-todo-beryl.vercel.app/api/todo",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const result = await response.json();
        console.log("Fetched data:", result);

        if (result.success) {
          setTasks(result.user.todos);
        } else {
          console.error("Error fetching data:", result.error);
          setTasks([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isUpdated, token]);

  const columns = [
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
    const todoId = tasks[index]._id;

    fetch(`https://backend-todo-beryl.vercel.app/api/todo/${todoId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
        setIsUpdated(isUpdated + 1);
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
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        })
          .then((response) => response.json())
          .then((result) => {
            console.log("result ....", result);
            if (result.todo) {
              setTasks([...tasks, result.todo]);
              setData({
                title: "",
                description: "",
                days: getTodayDate(),
                schedule: "",
              });
              Swal.fire({
                icon: "success",
                title: "Todo Added",
                showConfirmButton: false,
                timer: 1200,
              });
              setIsUpdated(isUpdated + 1);
            } else {
              console.error("Error adding todo:", result.error);
              Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to add todo",
              });
            }
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
          `https://backend-todo-beryl.vercel.app/api/todo/${tasks[index]._id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
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

  const EditHandler = (index) => {
    setOpenEditPanel(true);
    const editTask1 = tasks[index];
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
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(editTask),
          }
        )
          .then((response) => response.json())
          .then((result) => {
            if (result.success) {
              Swal.fire({
                icon: "success",
                title: "Todo Edited",
                showConfirmButton: false,
                timer: 1200,
              });
              setIsUpdated(isUpdated + 1);
              setOpenEditPanel(false);
            } else {
              console.error("Error editing todo:", result.error);
              Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to edit todo",
              });
            }
          })
          .catch((error) => {
            console.error("Error editing data:", error);
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "Failed to edit todo",
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

  const activeTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  const Logout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  const pivotHeaderClass = mergeStyles({
    selectors: {
      ".ms-Pivot-link": {
        color: "#fff", // Change header text color to white
      },
      ".ms-Pivot-link.is-active": {
        color: "#fff", // Change active header text color to white
      },
    },
  });

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "#454545",
        display: "flex",
        flexDirection: "column",
        gap: "20px 0px",
      }}
      className="main"
    >
      <h1 style={{ color: "#fff", textAlign: "center" }}>Todo List</h1>
      <Stack className="logout-btn" spacing={2} direction="row">
        <Button variant="outlined" onClick={Logout}>
          Logout
        </Button>
      </Stack>
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
          min={getTodayDate()}
          max={getMaxDate()}
        />
        <TextField
          type="text"
          placeholder="Schedule"
          value={data.schedule}
          onChange={(e) => setData({ ...data, schedule: e.target.value })}
        />
        <PrimaryButton type="submit">Submit</PrimaryButton>
      </form>

      <div
        style={{ width: "63%", marginLeft: "20%", color: "#fff !important" }}
        className="hello"
      >
        {/* <Pivot aria-label="Basic Pivot Example">
          <PivotItem
            headerText="Active Tasks"
            headerButtonProps={{
              "data-order": 1,
              "data-title": "Active Tasks",
            }}

          >
            <Label styles={{ root: { color: "#fff" } }}>
              <div style={{ display: "grid", placeContent: "center" }}>
                {activeTasks.length === 0 ? (
                  <div>
                    <h1>No active tasks available</h1>
                  </div>
                ) : (
                  <DetailsList
                    items={activeTasks}
                    columns={columns}
                    setKey="set"
                    layoutMode={DetailsListLayoutMode.fixedColumns}
                    isMultiline={true}
                    selectionMode={0}
                    enableShimmer={loading}
                  />
                )}
              </div>
            </Label>
          </PivotItem>
          <PivotItem headerText="Completed">
            <Label styles={{ root: { color: "#fff" } }}>
              <div style={{ display: "grid", placeContent: "center" }}>
                {completedTasks.length === 0 ? (
                  <div>
                    <h1>No completed tasks available</h1>
                  </div>
                ) : (
                  <DetailsList
                    items={completedTasks}
                    columns={columns}
                    setKey="set"
                    layoutMode={DetailsListLayoutMode.fixedColumns}
                    isMultiline={true}
                    selectionMode={0}
                    enableShimmer={loading}
                  />
                )}
              </div>
            </Label>
          </PivotItem>
        </Pivot> */}

        <Pivot aria-label="Basic Pivot Example" className={pivotHeaderClass}>
          <PivotItem
            headerText="Active Tasks"
            headerButtonProps={{
              "data-order": 1,
              "data-title": "Active Tasks",
            }}
          >
            <Label styles={{ root: { color: "#fff" } }}>
              <div style={{ display: "grid", placeContent: "center" }}>
                {/* Assume activeTasks and columns are defined */}
                {activeTasks.length === 0 ? (
                  <div>
                    <h1 style={{ color: "#fff" }}>No active tasks available</h1>
                  </div>
                ) : (
                  <DetailsList
                    items={activeTasks}
                    columns={columns}
                    setKey="set"
                    layoutMode={DetailsListLayoutMode.fixedColumns}
                    isMultiline={true}
                    selectionMode={0}
                    enableShimmer={loading}
                  />
                )}
              </div>
            </Label>
          </PivotItem>
          <PivotItem headerText="Completed">
            <Label styles={{ root: { color: "#fff" } }}>
              <div style={{ display: "grid", placeContent: "center" }}>
                {/* Assume completedTasks and columns are defined */}
                {completedTasks.length === 0 ? (
                  <div>
                    <h1 style={{ color: "#fff" }}>
                      No completed tasks available
                    </h1>
                  </div>
                ) : (
                  <DetailsList
                    items={completedTasks}
                    columns={columns}
                    setKey="set"
                    layoutMode={DetailsListLayoutMode.fixedColumns}
                    isMultiline={true}
                    selectionMode={0}
                    enableShimmer={loading}
                  />
                )}
              </div>
            </Label>
          </PivotItem>
        </Pivot>
      </div>
      <Panel
        isOpen={openEditPanel}
        headerText="Edit Task"
        onDismiss={() => setOpenEditPanel(false)}
      >
        <form
          onSubmit={SubmitEditHandler}
          style={{ display: "flex", flexDirection: "column", gap: "10px 0" }}
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
            onChange={(e) => setEditTask({ ...editTask, days: e.target.value })}
            min={getTodayDate()}
            max={getMaxDate()}
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
  );
};

export default App;
