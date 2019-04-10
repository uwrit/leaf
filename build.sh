#!/usr/local/bin/python3
# Produces a production build of Leaf

# v2:
# /bin/{runtime} for publish artifacts and tar

import os
import shutil
from subprocess import Popen, PIPE
from argparse import ArgumentParser, Namespace
from collections import namedtuple
from typing import *


class FSEnv:
    def __init__(self):
        self.proj_dir = os.path.dirname(os.path.realpath(__file__))

    @property
    def bin_dir(self):
        return os.path.join(self.proj_dir, 'bin')

    @property
    def api_proj(self):
        return os.path.join(self.proj_dir, 'src', 'server', 'API', 'API.csproj')


class Runtime:
    def __init__(self, name, output_folder, args = []):
        self.name = name
        self.output_folder = output_folder
        self.tar_file = 'leaf_{}.tar.gz'.format(self.name)
        self.args = args

    @staticmethod
    def rhel7(env: FSEnv):
        return Runtime('rhel7', os.path.join(env.bin_dir, 'rhel7'), [
            '-r', 'rhel.7-x64', '--self-contained', 'false', '/p:MicrosoftNETPlatformLibrary=Microsoft.NETCore.App'])

    @staticmethod
    def win(env: FSEnv):
        return Runtime('win', os.path.join(env.bin_dir, 'win'))


class LeafBuilder:
    def __init__(self, args: Namespace):
        self.env: FSEnv = FSEnv()
        self.runtimes: Iterable[Runtime] = LeafBuilder.get_runtimes(
            self.env, args)

    @staticmethod
    def get_runtimes(env: FSEnv, args: Namespace) -> Iterable[Runtime]:
        rt = []
        if args.rhel7:
            rt.append(Runtime.rhel7(env))
        if args.win:
            rt.append(Runtime.win(env))
        return rt

    def build_single(self, runtime: Runtime):
        ensure_clean_runtime(runtime)
        publish(self.env, runtime)
        tar(self.env, runtime)
        clean_runtime(runtime, remove_tar=False)

    def build(self):
        if not self.runtimes:
            print('No runtimes selected.')
            return
        print('Building Leaf for production...')
        ensure_bin(self.env)
        for runtime in self.runtimes:
            try:
                self.build_single(runtime)
            except Exception as e:
                print('{}'.format(e))


def report_error(err, m):
    msg = str(err, 'utf-8').strip() + '\n'
    if m:
        msg += ' ' + m
    return msg


def clean_runtime(runtime: Runtime, remove_tar: bool = True):
    directory = runtime.output_folder
    for f in os.listdir(directory):
        path = os.path.join(directory, f)
        if os.path.isfile(path):
            if not remove_tar and f.endswith(runtime.tar_file):
                continue
            os.unlink(path)
        elif os.path.isdir(path):
            shutil.rmtree(path)


def ensure_bin(env: FSEnv):
    print('Ensuring bin directory is present...')
    if not os.path.isdir(env.bin_dir):
        os.mkdir(env.bin_dir)


def ensure_clean_runtime(runtime: Runtime):
    print('Ensuring {} runtime directory is clean...'.format(runtime.output_folder))
    if not os.path.isdir(runtime.output_folder):
        os.mkdir(runtime.output_folder)
        return
    clean_runtime(runtime)


def get_publish_args(env: FSEnv, runtime: Runtime) -> Iterable[str]:
    args = ['dotnet', 'publish', '-c', 'Release',
            '-o', runtime.output_folder]
    for a in runtime.args:
        args.append(a)
    args.append(env.api_proj)
    return args


def publish(env: FSEnv, runtime: Runtime):
    print('Building API for {}...'.format(runtime.name))
    args = get_publish_args(env, runtime)
    p = Popen(args)
    if p.wait() != 0:
        raise Exception(report_error(p.stdout.read(),
                                     'Error building Leaf API for {}...'.format(runtime.name)))
    print('Built API for {}...'.format(runtime.name))


def tar(env: FSEnv, runtime: Runtime):
    print('Compressing Leaf API artifacts for {}...'.format(runtime.name))
    os.chdir(runtime.output_folder)
    p = Popen(['tar', '--exclude', runtime.tar_file,
               '-czf', runtime.tar_file, '.'])
    if p.wait() != 0:
        raise Exception(report_error(p.stdout.read(),
                                     'Error compressing Leaf for {}...'.format(runtime.name)))
    os.chdir(env.proj_dir)
    print('Compressed Leaf to {}...'.format(
        os.path.join(runtime.output_folder, runtime.tar_file)))


def get_args() -> Namespace:
    parser = ArgumentParser(
        prog='build.sh', description="This script builds Leaf's backend for various runtime targets.")
    parser.add_argument('--rhel7', action='store_true',
                        help='Targets RHEL7 and Cent7 (not self-contained), outputs to ./bin/rhel7/leaf_rhel7.tar.gz')
    parser.add_argument('--win', action='store_true',
                        help='Targets Windows (not self-contained), outputs to ./bin/win/leaf_win.tar.gz')
    return parser.parse_args()


def main():
    args = get_args()
    builder = LeafBuilder(args)
    builder.build()
    print('Done...')


main()
