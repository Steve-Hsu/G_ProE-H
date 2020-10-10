<select
  id={`Unit${mtrl.id}`}
  name={mtrl.id}
  list='garmentSize'
  placeholder='Unit'
  onChange={addMtrlValue}
  autoFocus
  default='yd'
  className='select-primary'
>
  {unitList.map((s) => {
    return (
      <option key={`${s}${mtrl.id}`} id={`${s}${mtrl.id}`} value={s}>
        {s}
      </option>
    );
  })}
</select>;

const unitList = [
  'yds',
  'm',
  'cm',
  'in',
  'set',
  'print size',
  'pcs',
  'gross',
  'doz',
  'g',
];
