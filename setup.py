from setuptools import setup, find_packages

setup(
    name="toolbox_installer",
    version="1.0.0",
    description="Multi-platform interactive package installer",
    author="David7ce",
    packages=find_packages(),
    install_requires=[
        "inquirer",
    ],
    entry_points={
        "console_scripts": [
            "toolbox=cli_full:main"
        ]
    },
    include_package_data=True,
    package_data={"": ["pkgs/packages-info.json"]}
)