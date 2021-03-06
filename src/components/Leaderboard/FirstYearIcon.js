import moment from 'moment'
import React from 'react'





import FirstYearSvg from '../../../public/static/svg/firstYear.svg'





function FirstYearIcon ({ createdAt, ...iconProps }) {
  return moment(createdAt).isBefore('2016-01-01', 'year') && (
    <div
      className="achievement first-year"
      title="This rat joined in our first year of operation!">
      <FirstYearSvg className="size-32 fixed" {...iconProps} />
    </div>
  )
}





export default FirstYearIcon
