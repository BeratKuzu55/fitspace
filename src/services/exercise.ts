export const CalculateWorkoutPoint = (exercises: any[]) => {
  let point = 0;

  exercises.forEach(e => {
    const _diff =
      e.difficulty === 'easy' ? 1 : e.difficulty === 'medium' ? 1.5 : 2;
    const _time = e.repetitions === 0 ? e.duration * 0.15 : e.repetitions * 0.2;
    const _set =
      e.setcount === 1
        ? 1
        : e.setcount === 2
          ? 1.2
          : e.setcount === 3
            ? 1.4
            : e.setcount > 3
              ? 1.6
              : 1;
    const _group =
      e.exercise_group === 'A' ? 1.2 : e.exercise_group === 'B' ? 1.1 : 1;
    const _equipm = e.equipments.length !== 0 ? 1.3 : 1;
    const _type = e.exercise_type === 'main' ? 10 : 2;
    const _format =
      e.exercise_format === 'strength'
        ? 4
        : e.exercise_format === 'cardio'
          ? 3
          : 2;

    point += _diff * _set * (_time + _type + _format) * _group * _equipm;
  });
  return Math.floor(point);
};
