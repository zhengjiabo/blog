
```js
import React, { useState, useEffect } from 'react'
import useCountDown from './useCountDown'

// useCountDown.js
const useCountDown = (initialSeconds) => {
    const [seconds, setSeconds] = useState(initialSeconds);
    const [startTime, setStartTime] = useState(null);

    useEffect(() => {
        // 如果秒数大于0并且开始时间未设置，则记录开始时间
        if (seconds > 0 && startTime === null) {
            setStartTime(Date.now());
        } else if (seconds === 0) {
            // 如果秒数归零则重置开始时间
            setStartTime(null);
        }
    }, [seconds]);

    useEffect(() => {
        const timer = setInterval(() => {
            if (startTime !== null) {
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                setSeconds(c => (c - elapsed < 0 ? 0 : c - elapsed));
            }
        }, 1000);

        return () => clearInterval(timer); // 清理计时器
    }, [startTime]);

    return [seconds, setSeconds];
};



// use it
const Demo = () => { 
	const [seconds, setSecond] = useCountDown(0) 
	return ( 
		<Button 
			disable={seconds !== 0} 
			onClick={() => setSecond(59)}
         > 	
			 {seconds > 0 ? `${seconds}s后可点击` : '点击开始倒计时'} 
		 </Button> 
	 )
}
```

