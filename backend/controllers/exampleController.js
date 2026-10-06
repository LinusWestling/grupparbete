exports.getExample = (req, res) => {
  const exercises = [
    { id: 1, name: 'Squat', primaryMuscle: 'Quadriceps' },
    { id: 2, name: 'Push-up', primaryMuscle: 'Pectoralis major' },
  ]

  res.json(exercises)
}
