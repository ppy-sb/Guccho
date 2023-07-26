import type { H3Event } from 'h3'
import { UAParser } from 'ua-parser-js'
import type { Session } from '$base/server/session'
import { Client, OS } from '~/def/device'

// TODO finish me
export function detectDevice(e: H3Event) {
  const ua = getRequestHeader(e, 'User-Agent')
  const r: Omit<Session<string>, 'lastSeen'> = {
    OS: OS.Unknown,
    client: Client.Unknown,
  }
  if (!ua) {
    return r
  }
  const res = UAParser(ua)

  switch (res.os.name) {
    case 'Windows': {
      r.OS = OS.Windows
      break
    }
    case 'Mac OS': {
      if (res.device.type === 'tablet') {
        r.OS = OS.iPadOS
      }
      else {
        r.OS = OS.macOS
      }
      break
    }
    case 'iOS': {
      r.OS = OS.iOS
      break
    }
    // case 'iPadOS': {
    //   r.OS = OS.iPadOS
    //   break
    // }
    case 'Android': {
      r.OS = OS.Android
      break
    }
    case 'Chromium OS': {
      r.OS = OS.ChromeOS
      break
    }
    case 'Linux':
    case 'GNU':
    case 'Debian':
    case 'Arch':
    case 'CentOS':
    case 'Fedora':
    case 'Gentoo':
    case 'Mint':
    case 'Nintendo':
    case 'PCLinuxOS':
    case 'RedHat':
    case 'SUSE':
    case 'Tizen':
    case 'Ubuntu':
    case 'VectorLinux':
    {
      r.OS = OS.Linux
    }
  }

  if (res.browser.name) {
    r.client = Client.Browser
  }

  return r
}
