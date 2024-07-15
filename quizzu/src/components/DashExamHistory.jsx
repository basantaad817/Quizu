"use client";

import { useEffect, useState, useRef } from "react";
import Chart from "chart.js/auto";
import "chartjs-adapter-date-fns";
import ApiRequest from "@/utils/apiRequest";
import { useAuth } from "@/context/userContext";
import zoomPlugin from "chartjs-plugin-zoom";

const DashExamHistory = () => {
  const { user } = useAuth();
  const chartContainer = useRef(null);
  const chartInstance = useRef(null);
  const [scoreData, setScoreData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await ApiRequest.get(`/score/profile/${user._id}`);
        console.log(response);
        setScoreData(response?.data?.data?.scores);
      } catch (error) {
        console.error("Error fetching user scores:", error);
      }
    };

    fetchData();
  }, [user._id]);

  const latestScores = scoreData.slice(-10);

  const userScores = latestScores.map((score) => {
    const parsedDate = new Date(score.createdAt);
    const formattedDate = parsedDate.toLocaleDateString();
    return {
      ...score,
      formattedDate,
      parsedDate,
      quizTitle: score?.quiz?.title,
      categoryTitle: score?.quiz?.category?.name,
    };
  });

  useEffect(() => {
    if (userScores.length === 0) return;

    if (chartContainer && chartContainer.current && latestScores.length > 0) {
      const ctx = chartContainer.current.getContext("2d");

      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      chartInstance.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: userScores.map((score) => score.formattedDate),
          datasets: [
            {
              label: "Scores",
              data: userScores.map((score) => score.score),
              fill: false,
              borderColor: "rgb(75, 192, 192)",
              tension: 0.1,
              pointStyle: "circle",
              pointRadius: 5,
            },
          ],
        },
        options: {
          plugins: {
            zoom: {
              pan: {
                enabled: true,
                mode: "x",
                rangeMin: {
                  x: null,
                  y: null,
                },
                rangeMax: {
                  x: null, // Restrict panning on the x-axis
                  y: null, // Restrict panning on the y-axis
                },
              },
              zoom: {
                wheel: {
                  enabled: false,
                },
                pinch: {
                  enabled: false,
                },
                mode: "x",
                rangeMin: {
                  x: null,
                  y: null,
                },
                rangeMax: {
                  x: null,
                  y: null,
                },
              },
            },
            tooltip: {
              callbacks: {
                title: function (tooltipItems) {
                  const tooltipItem = tooltipItems[0];
                  const quizTitle =
                    userScores[tooltipItem.dataIndex]?.quizTitle;
                  const categoryTitle =
                    userScores[tooltipItem.dataIndex]?.categoryTitle;
                  return `Category: ${categoryTitle}\nQuiz: ${quizTitle}`;
                },
                label: function (tooltipItem) {
                  return `Score: ${tooltipItem.raw}`;
                },
              },
            },
          },
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: "category",
              labels: userScores.map((score) => score.formattedDate),
              grid: {
                display: false,
              },
            },
            y: {
              title: {
                display: true,
                text: "Score",
              },
              grid: {
                display: true,
              },
              ticks: {
                beginAtZero: false,
                callback: function (value) {
                  return value.toFixed(0);
                },
              },
            },
          },
        },
        plugins: [zoomPlugin],
      });
    }
  }, [latestScores, userScores]);

  return (
    <div className="md:w-[789px] mx-auto h-full pb-10 px-4 pt-2">
      <div className="w-full overflow-x-auto">
        {scoreData.length === 0 ? (
          <div className="text-2xl font-semibold text-gray-600">
            No exam taken yet
          </div>
        ) : (
          <canvas ref={chartContainer} className="h-[400px]"></canvas>
        )}
      </div>
    </div>
  );
};

export default DashExamHistory;
