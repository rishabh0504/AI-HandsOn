import logging
import colorlog

logging_level = logging.DEBUG
log_colors = {
    'DEBUG': 'cyan',
    'INFO': 'green',
    'WARNING': 'yellow',
    'ERROR': 'red',
    'CRITICAL': 'bold_red',
}

formatter = colorlog.ColoredFormatter('\n%(log_color)s[%(levelname)s]: %(message)s', log_colors=log_colors)
handler = logging.StreamHandler()
handler.setFormatter(formatter)

logger = colorlog.getLogger('bot_logger')
logger.setLevel(logging_level)
logger.addHandler(handler)