exports.getExample = (req, res) => {
  const exercises = [
    { id: 1, name: 'Knäböj', primaryMuscle: 'Framsida lår' },
    { id: 2, name: 'Armhävning', primaryMuscle: 'Stora bröstmuskeln' },
  ]

  res.json(exercises)
}
